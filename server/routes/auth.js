var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
var router = Router();
// Helper to generate a 6-digit invite code
var generateInviteCode = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
router.post('/create', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, teamName, password, existingTeam, inviteCode, isUnique, collision, password_hash, newTeam, token, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                _a = req.body, teamName = _a.teamName, password = _a.password;
                if (!teamName || teamName.trim() === '' || !password || password.trim() === '') {
                    return [2 /*return*/, res.status(400).json({ error: 'Team name and password are required' })];
                }
                return [4 /*yield*/, prisma.team.findUnique({ where: { name: teamName } })];
            case 1:
                existingTeam = _b.sent();
                if (existingTeam) {
                    return [2 /*return*/, res.status(400).json({ error: 'Team name is already taken' })];
                }
                inviteCode = void 0;
                isUnique = false;
                _b.label = 2;
            case 2:
                if (!!isUnique) return [3 /*break*/, 4];
                inviteCode = generateInviteCode();
                return [4 /*yield*/, prisma.team.findUnique({ where: { invite_code: inviteCode } })];
            case 3:
                collision = _b.sent();
                if (!collision)
                    isUnique = true;
                return [3 /*break*/, 2];
            case 4: return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 5:
                password_hash = _b.sent();
                return [4 /*yield*/, prisma.team.create({
                        data: {
                            name: teamName,
                            password_hash: password_hash,
                            invite_code: inviteCode,
                            members_count: 1
                        },
                    })];
            case 6:
                newTeam = _b.sent();
                token = jwt.sign({ teamId: newTeam.id, role: newTeam.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
                res.json({ token: token, team: { id: newTeam.id, name: newTeam.name, role: newTeam.role, invite_code: newTeam.invite_code, has_seen_prologue: newTeam.has_seen_prologue } });
                return [3 /*break*/, 8];
            case 7:
                error_1 = _b.sent();
                console.error('Create team error:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
router.post('/join', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var inviteCode, team, updatedTeam, token, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                inviteCode = req.body.inviteCode;
                if (!inviteCode || inviteCode.trim() === '') {
                    return [2 /*return*/, res.status(400).json({ error: 'Invite code is required' })];
                }
                return [4 /*yield*/, prisma.team.findUnique({ where: { invite_code: inviteCode } })];
            case 1:
                team = _a.sent();
                if (!team) {
                    return [2 /*return*/, res.status(404).json({ error: 'Invalid invite code or team not found' })];
                }
                if (team.members_count >= 2) {
                    return [2 /*return*/, res.status(403).json({ error: 'This team is already full (maximum 2 agents)' })];
                }
                return [4 /*yield*/, prisma.team.update({
                        where: { id: team.id },
                        data: { members_count: { increment: 1 } }
                    })];
            case 2:
                updatedTeam = _a.sent();
                token = jwt.sign({ teamId: updatedTeam.id, role: updatedTeam.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
                res.json({ token: token, team: { id: updatedTeam.id, name: updatedTeam.name, role: updatedTeam.role, invite_code: updatedTeam.invite_code, has_seen_prologue: updatedTeam.has_seen_prologue } });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Join team error:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
export default router;
