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
var allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV !== 'production') {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
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
// Only listen if we are not running on Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, function () {
        console.log("Server is running on port ".concat(port));
    });
}
export default app;
