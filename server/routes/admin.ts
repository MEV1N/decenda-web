import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../server.js';

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
const upload = multer({ storage });

// Get all data for the admin dashboard
router.get('/all-data', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            include: { challenges: true },
            orderBy: { name: 'asc' }
        });
        const liveChallenges = await prisma.liveChallenge.findMany({
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
        const location = await prisma.location.upsert({
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

        const challenge = await prisma.challenge.upsert({
            where: { id },
            update: updateData,
            create: createData,
            include: { hints: true }
        });
        res.json(challenge);
    } catch (error) {
        console.error('Error creating/updating challenge:', error);
        res.status(500).json({ error: 'Internal server error' });
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
        const { id, challenge_id, hint_text, penalty_points } = req.body;
        const hint = await prisma.hint.upsert({
            where: { id: id || '' },
            update: {
                hint_text,
                penalty_points: penalty_points ? parseInt(penalty_points.toString()) : 0
            },
            create: {
                challenge_id,
                hint_text,
                penalty_points: penalty_points ? parseInt(penalty_points.toString()) : 0
            }
        });
        res.json(hint);
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
        const { title, description, is_bonus, points, is_locked, locked_instruction } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const file = files?.file?.[0];
        const thumbnail = files?.thumbnail?.[0];

        if (!title || !description || !file) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const file_url = `/uploads/${file.filename}`;
        const thumbnail_url = thumbnail ? `/uploads/${thumbnail.filename}` : null;

        const liveChallenge = await prisma.liveChallenge.create({
            data: {
                title,
                description,
                file_url,
                thumbnail_url,
                is_bonus: is_bonus === 'true' || is_bonus === true,
                points: points ? parseInt(points) : 0,
                is_locked: is_locked === 'true' || is_locked === true,
                locked_instruction: locked_instruction || null
            }
        });

        res.status(201).json(liveChallenge);
    } catch (error) {
        console.error('Error creating live challenge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update an existing live challenge
router.put('/live-challenge/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req: any, res) => {
    try {
        const { id } = req.params;
        const { title, description, is_bonus, points, is_locked, locked_instruction } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const file = files?.file?.[0];
        const thumbnail = files?.thumbnail?.[0];

        const updateData: Record<string, any> = {
            title,
            description,
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

        const liveChallenge = await prisma.liveChallenge.update({
            where: { id },
            data: updateData
        });

        res.json(liveChallenge);
    } catch (error) {
        console.error('Error updating live challenge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a live challenge
router.delete('/live-challenge/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find it first to delete the files
        const challenge = await prisma.liveChallenge.findUnique({ where: { id } });

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

        await prisma.liveChallenge.delete({
            where: { id }
        });

        res.json({ message: 'Live challenge deleted successfully' });
    } catch (error) {
        console.error('Error deleting live challenge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
