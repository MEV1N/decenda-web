import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth.js';
import gameRouter from './routes/game.js';
import leaderboardRouter from './routes/leaderboard.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
export const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/game', gameRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', time: new Date() });
});

// Serve frontend static files
const distPath = path.join(__dirname, '../../dist'); // from server/dist/server.js to root/dist
app.use(express.static(distPath));

// Catch-all to allow React Router to handle routing
app.get('*', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
