import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../server.js';
import { deleteLiveChallenge } from '../utils/challengeCleanup.js';

const router = Router();
router.use(authenticate, requireAdmin);

// Multer setup for memory storage (for Vercel persistence via DB)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Get all data for the admin dashboard
router.get('/all-data', async (req, res) => {
    try {
        const locations = await (prisma as any).location.findMany({
            include: {
                challenges: {
                    include: { hints: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        const liveChallenges = await (prisma as any).liveChallenge.findMany({
            orderBy: { created_at: 'desc' }
        });

        res.json({ locations, liveChallenges });
    } catch (error) {
        console.error('Error fetching all data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create or update a location
router.post('/location', async (req, res) => {
    try {
        const { id, name, description, is_starting } = req.body;
        const location = await (prisma as any).location.upsert({
            where: { id },
            update: { name, description, is_starting },
            create: { id, name, description, is_starting }
        });
        res.json(location);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create or update a challenge
router.post('/challenge', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req: any, res) => {
    try {
        const { id, location_id, title, description, flag_hash, points, instance_required, unlocksLocations, unlocksPoints, is_locked, locked_instruction } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const file = files?.file?.[0];
        const thumbnail = files?.thumbnail?.[0];

        if (!id) {
            return res.status(400).json({ error: 'Missing challenge ID' });
        }

        let file_url: string | undefined = undefined;
        let thumbnail_url: string | undefined = undefined;

        const existingChallenge = await (prisma as any).challenge.findUnique({ where: { id } });

        if (file) {
            if (existingChallenge && existingChallenge.file_url) {
                const fileName = path.basename(existingChallenge.file_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) {
                    try { fs.unlinkSync(filePath); } catch (e) { console.warn(`[Admin] Could not delete old file: ${filePath}`); }
                }
            }
            file_url = `/uploads/${file.filename}`;
        }

        if (thumbnail) {
            if (existingChallenge && existingChallenge.thumbnail_url) {
                const fileName = path.basename(existingChallenge.thumbnail_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) {
                    try { fs.unlinkSync(filePath); } catch (e) { console.warn(`[Admin] Could not delete old thumbnail: ${filePath}`); }
                }
            }
            thumbnail_url = `/uploads/${thumbnail.filename}`;
        }

        let parsedUnlocks = [];
        try {
            parsedUnlocks = unlocksLocations ? (typeof unlocksLocations === 'string' ? JSON.parse(unlocksLocations) : unlocksLocations) : [];
        } catch {
        }

        const updateData: Record<string, any> = {
            location_id,
            title,
            description,
            flag_hash: flag_hash || '',
            points: points ? parseInt(points.toString()) : 0,
            instance_required: instance_required === 'true' || instance_required === true,
            unlocksLocations: parsedUnlocks,
            unlocksPoints: unlocksPoints === 'true' || unlocksPoints === true,
            is_locked: is_locked === 'true' || is_locked === true,
            locked_instruction: locked_instruction || null
        };

        if (file) {
            updateData.file_data = file.buffer;
            updateData.file_name = file.originalname;
            updateData.file_mime = file.mimetype;
            updateData.file_url = `/api/game/asset/challenge/${id}?type=file&t=${Date.now()}`;
        }
        if (thumbnail) {
            updateData.thumbnail_data = thumbnail.buffer;
            updateData.thumbnail_mime = thumbnail.mimetype;
            updateData.thumbnail_url = `/api/game/asset/challenge/${id}?type=thumbnail&t=${Date.now()}`;
        }

        const createData: any = {
            id,
            location_id,
            title,
            description,
            flag_hash: flag_hash || '',
            points: points ? parseInt(points.toString()) : 0,
            instance_required: instance_required === 'true' || instance_required === true,
            unlocksLocations: parsedUnlocks,
            unlocksPoints: unlocksPoints === 'true' || unlocksPoints === true,
            is_locked: is_locked === 'true' || is_locked === true,
            locked_instruction: locked_instruction || null,
            file_url: file ? `/api/game/asset/challenge/${id}?type=file` : null,
            thumbnail_url: thumbnail ? `/api/game/asset/challenge/${id}?type=thumbnail` : null,
            file_data: file ? file.buffer : null,
            file_name: file ? file.originalname : null,
            file_mime: file ? file.mimetype : null,
            thumbnail_data: thumbnail ? thumbnail.buffer : null,
            thumbnail_mime: thumbnail ? thumbnail.mimetype : null
        };

        const challenge = await (prisma as any).challenge.upsert({
            where: { id },
            update: updateData,
            create: createData,
            include: { hints: true }
        });

        res.json(challenge);
    } catch (error: any) {
        console.error('[Admin] FATAL ERROR IN CHALLENGE UPLOAD:', error);
        res.status(500).json({
            error: 'Failed to process challenge upload',
            message: error.message,
            prismaError: error.code || undefined
        });
    }
});

// Delete a challenge
router.delete('/challenge/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find it first to delete the files
        const challenge = await (prisma as any).challenge.findUnique({ where: { id } });

        // For DB storage, we don't need to manually delete disk files anymore
        // but let's keep it clean if files still exist from old mode
        if (challenge) {
            if (challenge.file_url && challenge.file_url.startsWith('/uploads')) {
                const fileName = path.basename(challenge.file_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) try { fs.unlinkSync(filePath); } catch (e) { }
            }
        }

        await (prisma as any).challenge.delete({
            where: { id }
        });

        res.json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        console.error('Error deleting challenge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create or update a hint
router.post('/hint', async (req, res) => {
    try {
        const { id, challenge_id, hint_text } = req.body;

        if (id) {
            const hint = await (prisma as any).hint.update({
                where: { id },
                data: { hint_text }
            });
            return res.json(hint);
        } else {
            const hint = await (prisma as any).hint.create({
                data: {
                    challenge_id,
                    hint_text
                }
            });
            return res.json(hint);
        }
    } catch (error) {
        console.error('Error creating/updating hint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a hint
router.delete('/hint/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (prisma as any).hint.delete({ where: { id } });
        res.json({ message: 'Hint deleted successfully' });
    } catch (error) {
        console.error('Error deleting hint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload a new live challenge (case file)
router.post('/live-challenge', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req: any, res) => {
    try {
        const { title, description, flag_hash, is_bonus, points, is_locked, locked_instruction } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const file = files?.file?.[0];
        const thumbnail = files?.thumbnail?.[0];

        if (!title || !description || !file) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const file_url = `/api/game/asset/liveChallenge/${Date.now()}?type=file`; // Temp ID will be replaced
        const thumbnail_url = thumbnail ? `/api/game/asset/liveChallenge/${Date.now()}?type=thumbnail` : null;

        const liveChallenge = await (prisma as any).liveChallenge.create({
            data: {
                title,
                description,
                file_url: 'temp', // Updated below
                flag_hash: flag_hash || null,
                thumbnail_url: 'temp',
                file_data: file.buffer,
                file_name: file.originalname,
                file_mime: file.mimetype,
                thumbnail_data: thumbnail ? thumbnail.buffer : null,
                thumbnail_mime: thumbnail ? thumbnail.mimetype : null,
                is_bonus: is_bonus === 'true' || is_bonus === true,
                points: points ? parseInt(points) : 0,
                is_locked: is_locked === 'true' || is_locked === true,
                locked_instruction: locked_instruction || null
            }
        });

        // Update URLs with correct ID
        const finalChallenge = await (prisma as any).liveChallenge.update({
            where: { id: liveChallenge.id },
            data: {
                file_url: `/api/game/asset/liveChallenge/${liveChallenge.id}?type=file`,
                thumbnail_url: thumbnail ? `/api/game/asset/liveChallenge/${liveChallenge.id}?type=thumbnail` : null
            }
        });

        res.status(201).json(finalChallenge);
    } catch (error: any) {
        console.error('Error creating live challenge:', error);
        res.status(500).json({
            error: 'Internal server error during live challenge upload',
            message: error.message,
            detail: String(error)
        });
    }
});

// Update an existing live challenge
router.put('/live-challenge/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req: any, res) => {
    try {
        const { id } = req.params;
        const { title, description, flag_hash, is_bonus, points, is_locked, locked_instruction } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const file = files?.file?.[0];
        const thumbnail = files?.thumbnail?.[0];

        const updateData: Record<string, any> = {
            title,
            description,
            flag_hash: flag_hash || null,
            is_bonus: is_bonus === 'true' || is_bonus === true,
            points: points ? parseInt(points) : 0,
            is_locked: is_locked === 'true' || is_locked === true,
            locked_instruction: locked_instruction || null
        };

        if (file) {
            updateData.file_data = file.buffer;
            updateData.file_name = file.originalname;
            updateData.file_mime = file.mimetype;
            updateData.file_url = `/api/game/asset/liveChallenge/${id}?type=file&t=${Date.now()}`;
        }

        if (thumbnail) {
            updateData.thumbnail_data = thumbnail.buffer;
            updateData.thumbnail_mime = thumbnail.mimetype;
            updateData.thumbnail_url = `/api/game/asset/liveChallenge/${id}?type=thumbnail&t=${Date.now()}`;
        }

        const liveChallenge = await (prisma as any).liveChallenge.update({
            where: { id },
            data: updateData
        });

        res.json(liveChallenge);
    } catch (error: any) {
        console.error('Error updating live challenge:', error);
        res.status(500).json({ error: error?.message || 'Internal server error', detail: String(error) });
    }
});

// Delete a live challenge
router.delete('/live-challenge/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteLiveChallenge(id);
        res.json({ message: 'Live challenge deleted successfully' });
    } catch (error) {
        console.error('Error deleting live challenge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
