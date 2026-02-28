import { Router } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/leaderboard
// Returns team leaderboard sorted by points DESC, then by earliest last solve
router.get('/', async (req, res) => {
    try {
        const teams = await prisma.team.findMany({
            where: { role: 'PLAYER' },
            select: {
                id: true,
                name: true,
                points: true,
                solves: {
                    orderBy: { solved_at: 'desc' },
                    take: 1
                },
                _count: {
                    select: { solves: true }
                }
            },
        });

        // Custom sorting: Points DESC, then Last Solve ASC
        const sortedTeams = teams.sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points;
            }

            const aLastSolve = a.solves[0]?.solved_at ? new Date(a.solves[0].solved_at).getTime() : 0;
            const bLastSolve = b.solves[0]?.solved_at ? new Date(b.solves[0].solved_at).getTime() : 0;

            // If no solves, they tie for earliest (0). Else earliest time wins (smaller timestamp)
            if (aLastSolve === 0 && bLastSolve === 0) return 0;
            if (aLastSolve === 0) return 1;
            if (bLastSolve === 0) return -1;

            return aLastSolve - bLastSolve;
        });

        res.json(sortedTeams.map((t, index) => ({
            rank: index + 1,
            id: t.id,
            name: t.name,
            points: t.points,
            solvesCount: t._count.solves,
            lastSolve: t.solves[0]?.solved_at || null
        })));

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
