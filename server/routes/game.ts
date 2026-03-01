import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../server.js';

const router = Router();

// GET /api/game/map
router.get('/map', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team!.teamId;

        const unlocked = await prisma.unlockedLocation.findMany({
            where: { team_id: teamId },
            select: { location_id: true }
        });

        const unlockedIds = unlocked.map((u: { location_id: string }) => u.location_id);

        const availableLocations = await prisma.location.findMany({
            where: {
                OR: [
                    { id: { in: unlockedIds } },
                    { is_starting: true }
                ]
            }
        });

        const allLocations = await prisma.location.findMany();

        const challenges = await prisma.challenge.findMany({
            select: { location_id: true, unlocksLocations: true }
        });

        const edges: { source: string, target: string }[] = [];
        for (const c of challenges) {
            if (c.unlocksLocations && c.unlocksLocations.length > 0) {
                for (const target of c.unlocksLocations) {
                    edges.push({ source: c.location_id, target });
                }
            }
        }

        const uniqueEdges = Array.from(new Set(edges.map(e => JSON.stringify(e)))).map(e => JSON.parse(e));

        res.json({
            locations: allLocations.map((loc: any) => ({
                ...loc,
                unlocked: loc.is_starting || unlockedIds.includes(loc.id)
            })),
            edges: uniqueEdges
        });

    } catch (error) {
        console.error('Error fetching map:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/game/location/:id
router.get('/location/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team!.teamId;
        const locationId = req.params.id as string;

        const location = await prisma.location.findUnique({ where: { id: locationId } });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        if (!location.is_starting) {
            const isUnlocked = await prisma.unlockedLocation.findUnique({
                where: { team_id_location_id: { team_id: teamId, location_id: locationId } }
            });
            if (!isUnlocked) {
                return res.status(403).json({ error: 'Location locked' });
            }
        }

        const challenges = await prisma.challenge.findMany({
            where: { location_id: locationId },
            include: {
                solves: {
                    where: { team_id: teamId }
                }
            }
        });

        const formattedChallenges = challenges.map((ch: any) => ({
            id: ch.id,
            title: ch.title,
            description: ch.description,
            points: ch.points,
            instance_required: ch.instance_required,
            solved: ch.solves.length > 0
        }));

        res.json({
            location,
            challenges: formattedChallenges
        });

    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/game/submit-flag
router.post('/submit-flag', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team?.teamId;
        if (!teamId) {
            return res.status(401).json({ error: 'Invalid session. Please log in again.' });
        }
        const { challengeId, flag } = req.body;

        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (flag !== challenge.flag_hash) {
            return res.status(400).json({ error: 'Incorrect flag' });
        }

        const existingSolve = await prisma.solve.findUnique({
            where: { team_id_challenge_id: { team_id: teamId, challenge_id: challengeId } }
        });

        if (existingSolve) {
            return res.status(400).json({ error: 'Challenge already solved' });
        }

        await prisma.solve.create({
            data: { team_id: teamId, challenge_id: challengeId }
        });

        // Award points
        if (challenge.unlocksPoints && challenge.points > 0) {
            try {
                await prisma.team.update({
                    where: { id: teamId },
                    data: { points: { increment: challenge.points } }
                });
            } catch (pointsErr) {
                console.error('Failed to award points:', pointsErr);
            }
        }

        // Unlock locations
        const newUnlocks = [];
        if (challenge.unlocksLocations && challenge.unlocksLocations.length > 0) {
            for (const locId of challenge.unlocksLocations) {
                try {
                    const alreadyUnlocked = await prisma.unlockedLocation.findUnique({
                        where: { team_id_location_id: { team_id: teamId, location_id: locId } }
                    });

                    if (!alreadyUnlocked) {
                        await prisma.unlockedLocation.create({
                            data: { team_id: teamId, location_id: locId }
                        });
                        newUnlocks.push(locId);
                    }
                } catch (unlockErr) {
                    console.error(`Failed to unlock location ${locId}:`, unlockErr);
                }
            }
        }

        res.json({ message: 'Correct flag!', newUnlocks, pointsAwarded: challenge.points });

    } catch (error) {
        console.error('Flag submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/game/prologue
router.post('/prologue', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team!.teamId;
        await prisma.team.update({
            where: { id: teamId },
            data: { has_seen_prologue: true }
        });
        res.json({ message: 'Prologue marked as seen' });
    } catch (error) {
        console.error('Error updating prologue status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
