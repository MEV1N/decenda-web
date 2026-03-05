import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth.js';
import gameRouter from './routes/game.js';
import leaderboardRouter from './routes/leaderboard.js';
import adminRouter from './routes/admin.js';

dotenv.config();

// ESM path variables (moved down to dev block to prevent Vercel Serverless crashing on transpiled CommonJs)

const app = express();
export const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV !== 'production') {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/game', gameRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req: express.Request, res: express.Response) => {
    const uploadDir = path.join(process.cwd(), 'server', 'uploads');
    res.json({
        status: 'ok',
        time: new Date(),
        uploadsDir: fs.existsSync(uploadDir)
    });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER_ERROR:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        code: err.code,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Only setup static serving and listening if we are not running on Vercel
if (process.env.NODE_ENV !== 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Serve frontend static files
    const distPath = path.join(__dirname, '../../dist'); // from server/dist/server.js to root/dist
    app.use(express.static(distPath));

    // Catch-all to allow React Router to handle routing
    app.get('*', (_req: express.Request, res: express.Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

import { deleteLiveChallenge } from './utils/challengeCleanup.js';

// Background task to delete expired jackpot challenges
setInterval(async () => {
    try {
        const expiredChallenges = await (prisma as any).liveChallenge.findMany({
            where: {
                is_bonus: true,
                created_at: {
                    lt: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
                }
            }
        });

        for (const challenge of expiredChallenges) {
            await deleteLiveChallenge(challenge.id);
        }
    } catch (error) {
        // Silently handle if Prisma is not ready or other errors during background cleanup
    }
}, 30 * 1000); // Check every 30 seconds

export default app;
