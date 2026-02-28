import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { prisma } from '../server';

const router = Router();
router.use(authenticate, requireAdmin);

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
router.post('/challenge', async (req, res) => {
    try {
        const { id, location_id, title, description, flag_hash, points, instance_required, unlocksLocations, unlocksPoints } = req.body;
        const challenge = await prisma.challenge.upsert({
            where: { id },
            update: { location_id, title, description, flag_hash, points, instance_required, unlocksLocations, unlocksPoints },
            create: { id, location_id, title, description, flag_hash, points, instance_required, unlocksLocations, unlocksPoints }
        });
        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
