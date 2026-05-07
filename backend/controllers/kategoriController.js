const { KategoriKesehatan, MasterTipe } = require('../models');

// GET /api/kategori
exports.getAllKategori = async (req, res) => {
  try {
    const kategori = await KategoriKesehatan.findAll({
      include: [{ model: MasterTipe, as: 'rumpun', attributes: ['nama_tipe', 'deskripsi'] }],
      order: [['id', 'ASC']]
    });
    res.json({ status: 'success', data: kategori });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};
