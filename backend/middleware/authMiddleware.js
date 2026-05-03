const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak' });
    }

    // Usually token format looks like "Bearer <token>"
    const token = authHeader.replace('Bearer ', '').trim();

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token tidak valid' });
    }
};

module.exports = authMiddleware;
