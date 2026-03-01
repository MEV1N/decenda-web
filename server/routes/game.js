var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { authenticate } from '../middleware/auth';
import { prisma } from '../server';
var router = Router();
// GET /api/game/map
router.get('/map', authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teamId, unlocked, unlockedIds_1, availableLocations, allLocations, challenges, edges, _i, challenges_1, c, _a, _b, target, uniqueEdges, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                teamId = req.team.teamId;
                return [4 /*yield*/, prisma.unlockedLocation.findMany({
                        where: { team_id: teamId },
                        select: { location_id: true }
                    })];
            case 1:
                unlocked = _c.sent();
                unlockedIds_1 = unlocked.map(function (u) { return u.location_id; });
                return [4 /*yield*/, prisma.location.findMany({
                        where: {
                            OR: [
                                { id: { in: unlockedIds_1 } },
                                { is_starting: true }
                            ]
                        }
                    })];
            case 2:
                availableLocations = _c.sent();
                return [4 /*yield*/, prisma.location.findMany()];
            case 3:
                allLocations = _c.sent();
                return [4 /*yield*/, prisma.challenge.findMany({
                        select: { location_id: true, unlocksLocations: true }
                    })];
            case 4:
                challenges = _c.sent();
                edges = [];
                for (_i = 0, challenges_1 = challenges; _i < challenges_1.length; _i++) {
                    c = challenges_1[_i];
                    if (c.unlocksLocations && c.unlocksLocations.length > 0) {
                        for (_a = 0, _b = c.unlocksLocations; _a < _b.length; _a++) {
                            target = _b[_a];
                            edges.push({ source: c.location_id, target: target });
                        }
                    }
                }
                uniqueEdges = Array.from(new Set(edges.map(function (e) { return JSON.stringify(e); }))).map(function (e) { return JSON.parse(e); });
                res.json({
                    locations: allLocations.map(function (loc) { return (__assign(__assign({}, loc), { unlocked: loc.is_starting || unlockedIds_1.includes(loc.id) })); }),
                    edges: uniqueEdges
                });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _c.sent();
                console.error('Error fetching map:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// GET /api/game/location/:id
router.get('/location/:id', authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teamId, locationId, location_1, isUnlocked, challenges, formattedChallenges, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                teamId = req.team.teamId;
                locationId = req.params.id;
                return [4 /*yield*/, prisma.location.findUnique({ where: { id: locationId } })];
            case 1:
                location_1 = _a.sent();
                if (!location_1) {
                    return [2 /*return*/, res.status(404).json({ error: 'Location not found' })];
                }
                if (!!location_1.is_starting) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.unlockedLocation.findUnique({
                        where: { team_id_location_id: { team_id: teamId, location_id: locationId } }
                    })];
            case 2:
                isUnlocked = _a.sent();
                if (!isUnlocked) {
                    return [2 /*return*/, res.status(403).json({ error: 'Location locked' })];
                }
                _a.label = 3;
            case 3: return [4 /*yield*/, prisma.challenge.findMany({
                    where: { location_id: locationId },
                    include: {
                        solves: {
                            where: { team_id: teamId }
                        }
                    }
                })];
            case 4:
                challenges = _a.sent();
                formattedChallenges = challenges.map(function (ch) { return ({
                    id: ch.id,
                    title: ch.title,
                    description: ch.description,
                    points: ch.points,
                    instance_required: ch.instance_required,
                    solved: ch.solves.length > 0
                }); });
                res.json({
                    location: location_1,
                    challenges: formattedChallenges
                });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error('Error fetching location:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// POST /api/game/submit-flag
router.post('/submit-flag', authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teamId, _a, challengeId, flag, challenge, existingSolve, pointsErr_1, newUnlocks, _i, _b, locId, alreadyUnlocked, unlockErr_1, error_3;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 16, , 17]);
                teamId = (_c = req.team) === null || _c === void 0 ? void 0 : _c.teamId;
                if (!teamId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid session. Please log in again.' })];
                }
                _a = req.body, challengeId = _a.challengeId, flag = _a.flag;
                return [4 /*yield*/, prisma.challenge.findUnique({ where: { id: challengeId } })];
            case 1:
                challenge = _d.sent();
                if (!challenge) {
                    return [2 /*return*/, res.status(404).json({ error: 'Challenge not found' })];
                }
                if (flag !== challenge.flag_hash) {
                    return [2 /*return*/, res.status(400).json({ error: 'Incorrect flag' })];
                }
                return [4 /*yield*/, prisma.solve.findUnique({
                        where: { team_id_challenge_id: { team_id: teamId, challenge_id: challengeId } }
                    })];
            case 2:
                existingSolve = _d.sent();
                if (existingSolve) {
                    return [2 /*return*/, res.status(400).json({ error: 'Challenge already solved' })];
                }
                return [4 /*yield*/, prisma.solve.create({
                        data: { team_id: teamId, challenge_id: challengeId }
                    })];
            case 3:
                _d.sent();
                if (!(challenge.unlocksPoints && challenge.points > 0)) return [3 /*break*/, 7];
                _d.label = 4;
            case 4:
                _d.trys.push([4, 6, , 7]);
                return [4 /*yield*/, prisma.team.update({
                        where: { id: teamId },
                        data: { points: { increment: challenge.points } }
                    })];
            case 5:
                _d.sent();
                return [3 /*break*/, 7];
            case 6:
                pointsErr_1 = _d.sent();
                console.error('Failed to award points:', pointsErr_1);
                return [3 /*break*/, 7];
            case 7:
                newUnlocks = [];
                if (!(challenge.unlocksLocations && challenge.unlocksLocations.length > 0)) return [3 /*break*/, 15];
                _i = 0, _b = challenge.unlocksLocations;
                _d.label = 8;
            case 8:
                if (!(_i < _b.length)) return [3 /*break*/, 15];
                locId = _b[_i];
                _d.label = 9;
            case 9:
                _d.trys.push([9, 13, , 14]);
                return [4 /*yield*/, prisma.unlockedLocation.findUnique({
                        where: { team_id_location_id: { team_id: teamId, location_id: locId } }
                    })];
            case 10:
                alreadyUnlocked = _d.sent();
                if (!!alreadyUnlocked) return [3 /*break*/, 12];
                return [4 /*yield*/, prisma.unlockedLocation.create({
                        data: { team_id: teamId, location_id: locId }
                    })];
            case 11:
                _d.sent();
                newUnlocks.push(locId);
                _d.label = 12;
            case 12: return [3 /*break*/, 14];
            case 13:
                unlockErr_1 = _d.sent();
                console.error("Failed to unlock location ".concat(locId, ":"), unlockErr_1);
                return [3 /*break*/, 14];
            case 14:
                _i++;
                return [3 /*break*/, 8];
            case 15:
                res.json({ message: 'Correct flag!', newUnlocks: newUnlocks, pointsAwarded: challenge.points });
                return [3 /*break*/, 17];
            case 16:
                error_3 = _d.sent();
                console.error('Flag submission error:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 17];
            case 17: return [2 /*return*/];
        }
    });
}); });
// POST /api/game/prologue
router.post('/prologue', authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teamId, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                teamId = req.team.teamId;
                return [4 /*yield*/, prisma.team.update({
                        where: { id: teamId },
                        data: { has_seen_prologue: true }
                    })];
            case 1:
                _a.sent();
                res.json({ message: 'Prologue marked as seen' });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error updating prologue status:', error_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
export default router;
