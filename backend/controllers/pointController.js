const { ObjectPoint, KategoriKesehatan, User } = require('../models');

// GET /api/points  (user → milik sendiri; admin → semua)
exports.getAllPoints = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };
    const include = [
      { model: KategoriKesehatan, as: 'kategori', attributes: ['id', 'nama_kategori', 'icon_name', 'warna'] },
      { model: User, as: 'pemilik', attributes: ['id', 'username'] }
    ];
    const points = await ObjectPoint.findAll({ where, include, order: [['createdAt', 'DESC']] });
    res.json({ status: 'success', data: points });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// GET /api/points/explore  (publik – semua marker semua user)
exports.explorePoints = async (req, res) => {
  try {
    const points = await ObjectPoint.findAll({
      include: [
        { model: KategoriKesehatan, as: 'kategori', attributes: ['id', 'nama_kategori', 'icon_name', 'warna'] },
        { model: User, as: 'pemilik', attributes: ['username'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ status: 'success', data: points });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// POST /api/points
exports.createPoint = async (req, res) => {
  const { nama, alamat, latitude, longitude, kategori_id, atribut_tambahan } = req.body;
  try {
    if (!nama || !latitude || !longitude || !kategori_id)
      return res.status(400).json({ message: 'Field nama, koordinat, dan kategori wajib diisi' });

    const point = await ObjectPoint.create({
      nama, alamat, latitude, longitude,
      kategori_id, atribut_tambahan,
      user_id: req.user.id
    });
    const full = await ObjectPoint.findByPk(point.id, {
      include: [
        { model: KategoriKesehatan, as: 'kategori' },
        { model: User, as: 'pemilik', attributes: ['username'] }
      ]
    });
    res.json({ status: 'success', message: 'Point berhasil ditambahkan', data: full });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// PUT /api/points/:id
exports.updatePoint = async (req, res) => {
  try {
    const point = await ObjectPoint.findByPk(req.params.id);
    if (!point) return res.status(404).json({ message: 'Point tidak ditemukan' });

    // Hanya pemilik atau admin yang boleh edit
    if (req.user.role !== 'admin' && point.user_id !== req.user.id)
      return res.status(403).json({ message: 'Akses ditolak' });

    const { nama, alamat, latitude, longitude, kategori_id, atribut_tambahan } = req.body;
    await point.update({ nama, alamat, latitude, longitude, kategori_id, atribut_tambahan });
    res.json({ status: 'success', message: 'Point diperbarui', data: point });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

// DELETE /api/points/:id
exports.deletePoint = async (req, res) => {
  try {
    const point = await ObjectPoint.findByPk(req.params.id);
    if (!point) return res.status(404).json({ message: 'Point tidak ditemukan' });

    if (req.user.role !== 'admin' && point.user_id !== req.user.id)
      return res.status(403).json({ message: 'Akses ditolak' });

    await point.destroy();
    res.json({ status: 'success', message: 'Point dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};
