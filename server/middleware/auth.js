import jwt from 'jsonwebtoken';
export var authenticate = function (req, res, next) {
    var _a;
    var token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.team = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
export var requireAdmin = function (req, res, next) {
    var _a;
    if (((_a = req.team) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};
