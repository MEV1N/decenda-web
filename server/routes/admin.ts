import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../server.js';
import { deleteLiveChallenge } from '../utils/challengeCleanup.js';

const router = Router();
router.use(authenticate, requireAdmin);

// Multer setup for local file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'server', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
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

        let file_url: string | undefined = undefined;
        let thumbnail_url: string | undefined = undefined;

        const existingChallenge = await prisma.challenge.findUnique({ where: { id } });

        if (file) {
            // Delete the old file if it exists and updating
            if (existingChallenge && existingChallenge.file_url) {
                const fileName = path.basename(existingChallenge.file_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            file_url = `/uploads/${file.filename}`;
        }

        if (thumbnail) {
            // Delete the old thumbnail if it exists
            if (existingChallenge && existingChallenge.thumbnail_url) {
                const fileName = path.basename(existingChallenge.thumbnail_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            thumbnail_url = `/uploads/${thumbnail.filename}`;
        }

        if (!id) {
            return res.status(400).json({ error: 'Missing challenge ID' });
        }

        const updateData: Record<string, any> = {
            location_id,
            title,
            description,
            flag_hash,
            points: points ? parseInt(points.toString()) : 0,
            instance_required: instance_required === 'true' || instance_required === true,
            unlocksLocations: unlocksLocations ? (typeof unlocksLocations === 'string' ? JSON.parse(unlocksLocations) : unlocksLocations) : [],
            unlocksPoints: unlocksPoints === 'true' || unlocksPoints === true,
            is_locked: is_locked === 'true' || is_locked === true,
            locked_instruction: locked_instruction || null
        };

        if (file_url !== undefined) updateData.file_url = file_url;
        if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;

        const createData: any = {
            id,
            location_id,
            title,
            description,
            flag_hash,
            points: points ? parseInt(points.toString()) : 0,
            instance_required: instance_required === 'true' || instance_required === true,
            unlocksLocations: unlocksLocations ? (typeof unlocksLocations === 'string' ? JSON.parse(unlocksLocations) : unlocksLocations) : [],
            unlocksPoints: unlocksPoints === 'true' || unlocksPoints === true,
            is_locked: is_locked === 'true' || is_locked === true,
            locked_instruction: locked_instruction || null,
            file_url: file_url || null,
            thumbnail_url: thumbnail_url || null
        };

        const challenge = await (prisma as any).challenge.upsert({
            where: { id },
            update: updateData,
            create: createData,
            include: { hints: true }
        });
        res.json(challenge);
    } catch (error: any) {
        console.error('Error creating/updating challenge:', error);
        res.status(500).json({
            error: 'Internal server error during challenge upload',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Delete a challenge
router.delete('/challenge/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find it first to delete the files
        const challenge = await prisma.challenge.findUnique({ where: { id } });

        if (challenge) {
            if (challenge.file_url) {
                const fileName = path.basename(challenge.file_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            if (challenge.thumbnail_url) {
                const fileName = path.basename(challenge.thumbnail_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        }

        await prisma.challenge.delete({
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
        await prisma.hint.delete({ where: { id } });
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

        const file_url = `/uploads/${file.filename}`;
        const thumbnail_url = thumbnail ? `/uploads/${thumbnail.filename}` : null;

        const liveChallenge = await (prisma as any).liveChallenge.create({
            data: {
                title,
                description,
                file_url,
                flag_hash: flag_hash || null,
                thumbnail_url,
                is_bonus: is_bonus === 'true' || is_bonus === true,
                points: points ? parseInt(points) : 0,
                is_locked: is_locked === 'true' || is_locked === true,
                locked_instruction: locked_instruction || null
            }
        });

        res.status(201).json(liveChallenge);
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

        const existingChallenge = await prisma.liveChallenge.findUnique({ where: { id } });

        if (file) {
            // Delete the old file if it exists
            if (existingChallenge && existingChallenge.file_url) {
                const fileName = path.basename(existingChallenge.file_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            updateData.file_url = `/uploads/${file.filename}`;
        }

        if (thumbnail) {
            // Delete the old thumbnail if it exists
            if (existingChallenge && existingChallenge.thumbnail_url) {
                const fileName = path.basename(existingChallenge.thumbnail_url);
                const filePath = path.join(process.cwd(), 'server', 'uploads', fileName);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            updateData.thumbnail_url = `/uploads/${thumbnail.filename}`;
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
