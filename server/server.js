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
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
export var prisma = new PrismaClient();
var port = process.env.PORT || 3000;
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/game', gameRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin', adminRouter);
app.get('/api/health', function (req, res) {
    res.json({ status: 'ok', time: new Date() });
});
// Serve frontend static files
var distPath = path.join(__dirname, '../../dist'); // from server/dist/server.js to root/dist
app.use(express.static(distPath));
// Catch-all to allow React Router to handle routing
app.get('*', function (req, res) {
    res.sendFile(path.join(distPath, 'index.html'));
});
app.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
