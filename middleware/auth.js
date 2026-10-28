const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

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
            'SELECT id, first_name, last_name, email, status FROM customers WHERE id = ?',
            [decoded.id]
        );
        
        if (!users.length) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        if (users[0].status === "Blocked") {
            return res.status(403).json({ error: "Account has been blocked." });
        }

        req.user = {
            ...users[0],
            role: "customer",
            is_admin: false
        };
        if (req.session) {
            req.session.customer = {
                id: users[0].id,
                first_name: users[0].first_name,
                last_name: users[0].last_name,
                email: users[0].email
            };
        }
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
