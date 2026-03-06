import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../server.js';

const router = Router();

// GET /api/game/init - Consolidated initial data for the map
router.get('/init', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team!.teamId;
        const hasOverride = req.team?.teamName?.toLowerCase() === 'test' || req.team?.role === 'ADMIN';

        const [allLocations, liveChallenges, teamData] = await Promise.all([
            prisma.location.findMany({
                include: {
                    unlockedBy: {
                        where: { team_id: teamId },
                        select: { team_id: true }
                    },
                    challenges: {
                        select: { id: true, unlocksLocations: true }
                    }
                }
            }),
            (prisma as any).liveChallenge.findMany({
                orderBy: { created_at: 'desc' },
                include: {
                    solves: teamId ? {
                        where: { team_id: teamId }
                    } : false
                }
            }),
            prisma.team.findUnique({
                where: { id: teamId },
                select: { id: true, name: true, points: true, has_seen_prologue: true }
            })
        ]);

        const edges: { source: string, target: string }[] = [];
        for (const loc of allLocations) {
            for (const ch of loc.challenges) {
                if (ch.unlocksLocations && ch.unlocksLocations.length > 0) {
                    for (const target of ch.unlocksLocations) {
                        edges.push({ source: loc.id, target });
                    }
                }
            }
        }

        const uniqueEdges = Array.from(new Set(edges.map(e => JSON.stringify(e)))).map(e => JSON.parse(e));

        const formattedLive = liveChallenges.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            file_url: c.file_url,
            thumbnail_url: c.thumbnail_url,
            is_bonus: c.is_bonus,
            points: c.points,
            is_locked: hasOverride ? false : c.is_locked,
            locked_instruction: c.locked_instruction,
            created_at: c.created_at,
            has_solved: c.solves?.length > 0
        }));

        res.json({
            locations: allLocations.map((loc: any) => ({
                id: loc.id,
                name: loc.name,
                description: loc.description,
                is_starting: loc.is_starting,
                unlocked: hasOverride || loc.is_starting || loc.unlockedBy.length > 0
            })),
            edges: uniqueEdges,
            liveChallenges: formattedLive,
            team: teamData
        });

    } catch (error) {
        console.error('Error in /init:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/game/map
router.get('/map', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team!.teamId;
        const hasOverride = req.team?.teamName?.toLowerCase() === 'test' || req.team?.role === 'ADMIN';

        const allLocations = await prisma.location.findMany({
            include: {
                unlockedBy: {
                    where: { team_id: teamId },
                    select: { team_id: true }
                },
                challenges: {
                    select: { id: true, unlocksLocations: true }
                }
            }
        });

        const edges: { source: string, target: string }[] = [];
        for (const loc of allLocations) {
            for (const ch of loc.challenges) {
                if (ch.unlocksLocations && ch.unlocksLocations.length > 0) {
                    for (const target of ch.unlocksLocations) {
                        edges.push({ source: loc.id, target });
                    }
                }
            }
        }

        const uniqueEdges = Array.from(new Set(edges.map(e => JSON.stringify(e)))).map(e => JSON.parse(e));

        res.json({
            locations: allLocations.map((loc: any) => ({
                id: loc.id,
                name: loc.name,
                description: loc.description,
                is_starting: loc.is_starting,
                unlocked: hasOverride || loc.is_starting || loc.unlockedBy.length > 0
            })),
            edges: uniqueEdges
        });

    } catch (error) {
        console.error('Error fetching map:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/game/live-challenges
router.get('/live-challenges', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team?.teamId;

        const liveChallenges = await (prisma as any).liveChallenge.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                solves: teamId ? {
                    where: { team_id: teamId }
                } : false
            }
        });

        const hasOverride = req.team?.teamName?.toLowerCase() === 'test' || req.team?.role === 'ADMIN';
        const formattedLive = liveChallenges.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            file_url: c.file_url,
            thumbnail_url: c.thumbnail_url,
            is_bonus: c.is_bonus,
            points: c.points,
            is_locked: hasOverride ? false : c.is_locked,
            locked_instruction: c.locked_instruction,
            created_at: c.created_at,
            has_solved: c.solves?.length > 0
        }));

        res.json(formattedLive);
    } catch (error) {
        console.error('Error fetching live challenges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/game/location/:id
router.get('/location/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team!.teamId;
        const locationId = req.params.id as string;
        const hasOverride = req.team?.teamName?.toLowerCase() === 'test' || req.team?.role === 'ADMIN';

        const location = await prisma.location.findUnique({
            where: { id: locationId },
            include: {
                challenges: {
                    include: {
                        solves: {
                            where: { team_id: teamId }
                        },
                        hints: true
                    }
                },
                unlockedBy: !hasOverride ? {
                    where: { team_id: teamId }
                } : false
            }
        });

        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        if (!hasOverride && !location.is_starting && (location.unlockedBy as any).length === 0) {
            return res.status(403).json({ error: 'Location locked' });
        }

        const formattedChallenges = location.challenges.map((ch: any) => ({
            id: ch.id,
            title: ch.title,
            description: ch.description,
            points: ch.points,
            instance_required: ch.instance_required,
            solved: ch.solves.length > 0,
            is_locked: hasOverride ? false : ch.is_locked,
            locked_instruction: ch.locked_instruction,
            file_url: ch.file_url,
            thumbnail_url: ch.thumbnail_url,
            hints: ch.hints.map((h: any) => ({
                id: h.id,
                hint_text: h.hint_text
            }))
        }));

        res.json({
            location: {
                id: location.id,
                name: location.name,
                description: location.description,
                is_starting: location.is_starting
            },
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

// POST /api/game/instance/:name - Proxy to start investigation instances
router.post('/instance/:name', authenticate, async (req: AuthRequest, res) => {
    try {
        const { name } = req.params;
        const baseUrl = process.env.VITE_INSTANCE_SERVER || 'http://10.3.4.141:5000';

        const response = await fetch(`${baseUrl}/start?chal=${name}`);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error: any) {
        console.error('[INSTANCE_PROXY_ERROR]:', error.message, error.cause || error);
        res.status(500).json({ error: 'Failed to reach instance server. Please contact an admin.', details: error.message });
    }
});


// POST /api/game/submit-live-flag
router.post('/submit-live-flag', authenticate, async (req: AuthRequest, res) => {
    try {
        const teamId = req.team?.teamId;
        if (!teamId) {
            return res.status(401).json({ error: 'Invalid session. Please log in again.' });
        }
        const { challengeId, flag } = req.body;

        const challenge = await prisma.liveChallenge.findUnique({ where: { id: challengeId } });
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (challenge.is_locked) {
            return res.status(403).json({ error: 'This challenge is currently locked.' });
        }

        if (!(challenge as any).flag_hash) {
            return res.status(400).json({ error: 'No flag set for this challenge.' });
        }

        if (flag !== (challenge as any).flag_hash) {
            return res.status(400).json({ error: 'Incorrect flag' });
        }

        // Check if already solved (use LiveSolve)
        const existingSolve = await (prisma as any).liveSolve.findUnique({
            where: { team_id_challenge_id: { team_id: teamId, challenge_id: challengeId } }
        });

        if (existingSolve) {
            return res.status(400).json({ error: 'Challenge already solved by your team.' });
        }

        // Record the solve
        await (prisma as any).liveSolve.create({
            data: { team_id: teamId, challenge_id: challengeId }
        });

        // Award points to team
        if ((challenge as any).points > 0) {
            await (prisma as any).team.update({
                where: { id: teamId },
                data: { points: { increment: (challenge as any).points } }
            });
        }

        res.json({ message: 'Correct flag! Points awarded.', pointsAwarded: (challenge as any).points });

    } catch (error) {
        console.error('Live flag submission error:', error);
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

// Serve assets from the database
router.get('/asset/:model/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const model = String(req.params.model);
        const id = String(req.params.id);
        const type = typeof req.query.type === 'string' ? req.query.type : '';

        if (!['challenge', 'liveChallenge'].includes(model)) {
            return res.status(400).send('Invalid model');
        }

        const item = await (prisma as any)[model as string].findUnique({ where: { id } });

        if (!item) return res.status(404).send('Not found');

        let data: Buffer | null = null;
        let mime: string | null = null;
        let fileName: string | null = null;

        if (type === 'thumbnail') {
            data = item.thumbnail_data;
            mime = item.thumbnail_mime;
        } else {
            data = item.file_data;
            mime = item.file_mime;
            fileName = (item as any).file_name;
        }

        if (!data) return res.status(404).send('Data not found');

        res.setHeader('Content-Type', mime || 'application/octet-stream');
        if (type === 'thumbnail') {
            res.setHeader('Content-Disposition', `inline${fileName ? `; filename="${fileName}"` : ''}`);
        } else {
            res.setHeader('Content-Disposition', `attachment${fileName ? `; filename="${fileName}"` : ''}`);
        }
        res.send(data);
    } catch (error) {
        console.error('Error serving asset:', error);
        res.status(500).send('Internal server error');
    }
});

export default router;
