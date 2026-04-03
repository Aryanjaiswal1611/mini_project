const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const DeliveryPartner = require('../models/DeliveryPartner');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.session?.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission for this action.' });
        }
        next();
    };
};

// Legacy support for session-based checks if needed during migration
function isLoggedIn(req) {
    return !!(req.user || (req.session && req.session.user_id));
}

function isAdmin(req) {
    return (req.user && req.user.role === 'admin') || (isLoggedIn(req) && req.session.role === 'admin');
}

module.exports = { verifyToken, authorize, isLoggedIn, isAdmin, JWT_SECRET };
