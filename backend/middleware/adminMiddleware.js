// Middleware: hanya admin yang boleh akses
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ message: 'Akses hanya untuk Admin' });
  next();
};

module.exports = adminMiddleware;
