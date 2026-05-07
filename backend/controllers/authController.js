const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// POST /api/register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Semua field wajib diisi' });

    let existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: 'Email sudah terdaftar' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: passwordHash, role: 'user' });

    const token = jwt.sign(
      { user: { id: user.id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, role: user.role, userId: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// POST /api/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: 'Kredensial tidak valid' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Kredensial tidak valid' });

    const token = jwt.sign(
      { user: { id: user.id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, role: user.role, userId: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};
