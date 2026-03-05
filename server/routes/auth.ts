import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

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

        // Check for Master Admin Password
        const isAdmin = password === 'Dec@2k26#AdMins!';

        if (isAdmin) {
            let adminTeam = await prisma.team.findUnique({ where: { name: 'Admin' } });

            if (!adminTeam) {
                // Create the Admin team
                let inviteCode;
                let isUnique = false;
                while (!isUnique) {
                    inviteCode = generateInviteCode();
                    const collision = await prisma.team.findUnique({ where: { invite_code: inviteCode } });
                    if (!collision) isUnique = true;
                }
                const password_hash = await bcrypt.hash(password, 10);
                adminTeam = await prisma.team.create({
                    data: {
                        name: 'Admin',
                        password_hash,
                        invite_code: inviteCode!,
                        members_count: 1,
                        role: 'ADMIN'
                    }
                });
            } else {
                if (adminTeam.members_count >= 3) {
                    return res.status(403).json({ error: 'Admin team is full (maximum 3 agents)' });
                }
                adminTeam = await prisma.team.update({
                    where: { id: adminTeam.id },
                    data: { members_count: { increment: 1 } }
                });
            }

            const token = jwt.sign(
                { teamId: adminTeam.id, role: adminTeam.role, teamName: adminTeam.name },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );
            return res.json({ token, team: { id: adminTeam.id, name: adminTeam.name, role: adminTeam.role, invite_code: adminTeam.invite_code, has_seen_prologue: adminTeam.has_seen_prologue } });
        }

        // Normal player flow
        if (teamName.toLowerCase() === 'admin') {
            return res.status(403).json({ error: 'Reserved team name' });
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
                members_count: 1,
                role: 'PLAYER'
            },
        });

        const token = jwt.sign(
            { teamId: newTeam.id, role: newTeam.role, teamName: newTeam.name },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ token, team: { id: newTeam.id, name: newTeam.name, role: newTeam.role, invite_code: newTeam.invite_code, has_seen_prologue: newTeam.has_seen_prologue } });
    } catch (error) {
        console.error('Create team error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: `Backend crash: ${errorMessage}` });
    }
});

router.post('/join', async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode || inviteCode.trim() === '') {
            return res.status(400).json({ error: 'Invite code is required' });
        }

        const isAdminPassword = inviteCode === 'Dec@2k26#AdMins!';

        if (isAdminPassword) {
            let adminTeam = await prisma.team.findUnique({ where: { name: 'Admin' } });

            if (!adminTeam) {
                // If admin team doesn't exist, create it (this scenario should ideally be handled by /create)
                let newInviteCode;
                let isUnique = false;
                while (!isUnique) {
                    newInviteCode = generateInviteCode();
                    const collision = await prisma.team.findUnique({ where: { invite_code: newInviteCode } });
                    if (!collision) isUnique = true;
                }
                const password_hash = await bcrypt.hash(inviteCode, 10); // Hash the admin password
                adminTeam = await prisma.team.create({
                    data: {
                        name: 'Admin',
                        password_hash,
                        invite_code: newInviteCode!,
                        members_count: 1,
                        role: 'ADMIN'
                    }
                });
            } else {
                // If admin team exists, just join it (increment members_count)
                if (adminTeam.members_count >= 3) {
                    return res.status(403).json({ error: 'Admin team is full (maximum 3 agents)' });
                }
                adminTeam = await prisma.team.update({
                    where: { id: adminTeam.id },
                    data: { members_count: { increment: 1 } }
                });
            }

            const token = jwt.sign(
                { teamId: adminTeam.id, role: adminTeam.role, teamName: adminTeam.name },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );
            return res.json({ token, team: { id: adminTeam.id, name: adminTeam.name, role: adminTeam.role, invite_code: adminTeam.invite_code, has_seen_prologue: adminTeam.has_seen_prologue } });
        }

        const team = await prisma.team.findUnique({ where: { invite_code: inviteCode } });

        if (!team) {
            return res.status(404).json({ error: 'Invalid invite code or team not found' });
        }

        const maxMembers = team.name.toLowerCase() === 'test' ? 10 : 2;

        if (team.members_count >= maxMembers) {
            return res.status(403).json({ error: `This team is already full (maximum ${maxMembers} agents)` });
        }

        const updatedTeam = await prisma.team.update({
            where: { id: team.id },
            data: { members_count: { increment: 1 } }
        });

        const token = jwt.sign(
            { teamId: updatedTeam.id, role: updatedTeam.role, teamName: updatedTeam.name },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ token, team: { id: updatedTeam.id, name: updatedTeam.name, role: updatedTeam.role, invite_code: updatedTeam.invite_code, has_seen_prologue: updatedTeam.has_seen_prologue } });
    } catch (error) {
        console.error('Join team error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: `Backend crash: ${errorMessage}` });
    }
});

// POST /auth/logout - Decrement members_count when a user logs out
router.post('/logout', async (req, res) => {
    try {
        const { teamId } = req.body;

        if (!teamId) {
            return res.status(400).json({ error: 'Team ID is required' });
        }

        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.members_count > 0) {
            await prisma.team.update({
                where: { id: teamId },
                data: { members_count: { decrement: 1 } }
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: `Backend crash: ${errorMessage}` });
    }
});

export default router;
