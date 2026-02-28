import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

const router = Router();

// Helper to generate a 6-digit invite code
const generateInviteCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/create', async (req, res) => {
    try {
        const { teamName, password } = req.body;

        if (!teamName || teamName.trim() === '' || !password || password.trim() === '') {
            return res.status(400).json({ error: 'Team name and password are required' });
        }

        const existingTeam = await prisma.team.findUnique({ where: { name: teamName } });
        if (existingTeam) {
            return res.status(400).json({ error: 'Team name is already taken' });
        }

        let inviteCode;
        let isUnique = false;
        // Keep generating until unique (edge case prevention)
        while (!isUnique) {
            inviteCode = generateInviteCode();
            const collision = await prisma.team.findUnique({ where: { invite_code: inviteCode } });
            if (!collision) isUnique = true;
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newTeam = await prisma.team.create({
            data: {
                name: teamName,
                password_hash,
                invite_code: inviteCode!,
                members_count: 1
            },
        });

        const token = jwt.sign(
            { teamId: newTeam.id, role: newTeam.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ token, team: { id: newTeam.id, name: newTeam.name, role: newTeam.role, invite_code: newTeam.invite_code, has_seen_prologue: newTeam.has_seen_prologue } });
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/join', async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode || inviteCode.trim() === '') {
            return res.status(400).json({ error: 'Invite code is required' });
        }

        const team = await prisma.team.findUnique({ where: { invite_code: inviteCode } });

        if (!team) {
            return res.status(404).json({ error: 'Invalid invite code or team not found' });
        }

        if (team.members_count >= 2) {
            return res.status(403).json({ error: 'This team is already full (maximum 2 agents)' });
        }

        const updatedTeam = await prisma.team.update({
            where: { id: team.id },
            data: { members_count: { increment: 1 } }
        });

        const token = jwt.sign(
            { teamId: updatedTeam.id, role: updatedTeam.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ token, team: { id: updatedTeam.id, name: updatedTeam.name, role: updatedTeam.role, invite_code: updatedTeam.invite_code, has_seen_prologue: updatedTeam.has_seen_prologue } });
    } catch (error) {
        console.error('Join team error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
