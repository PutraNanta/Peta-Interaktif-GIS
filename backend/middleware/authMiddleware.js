const jwt = require('jsonwebtoken');

// Middleware: wajib login (user atau admin)
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader)
    return res.status(401).json({ message: 'Token tidak ditemukan' });

  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = authMiddleware;
