const { KategoriKesehatan, MasterTipe } = require("../models");

// GET /api/kategori — public
exports.getAllKategori = async (req, res) => {
  try {
    const kategori = await KategoriKesehatan.findAll({
      include: [{ model: MasterTipe, as: "rumpun", attributes: ["nama_tipe", "deskripsi"] }],
      order: [["id", "ASC"]],
    });
    res.json({ status: "success", data: kategori });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// POST /api/kategori — admin only
exports.createKategori = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Akses ditolak" });

    const { nama_kategori, warna, icon_name, fields, master_tipe_id } = req.body;
    if (!nama_kategori || !master_tipe_id)
      return res.status(400).json({ message: "nama_kategori dan master_tipe_id wajib diisi" });

    const existing = await KategoriKesehatan.findOne({ where: { nama_kategori } });
    if (existing)
      return res.status(400).json({ message: "Kategori dengan nama tersebut sudah ada" });

    const kat = await KategoriKesehatan.create({
      nama_kategori,
      warna: warna || "#3498db",
      icon_name: icon_name || null,
      fields: fields || [],
      master_tipe_id,
    });
    res.json({ status: "success", message: "Kategori berhasil ditambahkan", data: kat });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// PUT /api/kategori/:id — admin only
exports.updateKategori = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Akses ditolak" });

    const kat = await KategoriKesehatan.findByPk(req.params.id);
    if (!kat) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    const { nama_kategori, warna, icon_name, fields, master_tipe_id } = req.body;
    await kat.update({
      nama_kategori: nama_kategori ?? kat.nama_kategori,
      warna: warna ?? kat.warna,
      icon_name: icon_name ?? kat.icon_name,
      fields: fields ?? kat.fields,
      master_tipe_id: master_tipe_id ?? kat.master_tipe_id,
    });
    res.json({ status: "success", message: "Kategori diperbarui", data: kat });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// DELETE /api/kategori/:id — admin only
exports.deleteKategori = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Akses ditolak" });

    const kat = await KategoriKesehatan.findByPk(req.params.id);
    if (!kat) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    await kat.destroy();
    res.json({ status: "success", message: "Kategori dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};
