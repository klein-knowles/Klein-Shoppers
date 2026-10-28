const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

async function protect(req, res, next) {
    let token;

    if (req.session && req.session.customer) {
        req.user = {
            id: req.session.customer.id,
            email: req.session.customer.email,
            first_name: req.session.customer.first_name,
            last_name: req.session.customer.last_name,
            role: "customer",
            is_admin: false
        };
        return next();
    }
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await db.execute(
            'SELECT id, full_name, email, role, status, is_admin FROM customers WHERE id = ?',
            [decoded.id]
        );
        
        if (!users.length) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = users[0];
        next();
    } catch (error) {
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
}

function admin(req, res, next) {
    if (req.user && (req.user.is_admin || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
}

function auth(req, res, next) {
    if (req.session && req.session.customer) {
        req.user = {
            id: req.session.customer.id,
            email: req.session.customer.email,
            first_name: req.session.customer.first_name,
            last_name: req.session.customer.last_name,
            role: "customer",
            is_admin: false
        };
        return next();
    }

    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

auth.protect = protect;
auth.admin = admin;

module.exports = auth;
