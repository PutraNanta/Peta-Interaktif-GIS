const { ObjectPoint, KategoriKesehatan, User } = require("../models");
const { Op } = require("sequelize");

// GET /api/points  (user → hanya milik sendiri; admin → semua)
exports.getAllPoints = async (req, res) => {
  try {
    let where = {};
    if (req.user.role !== "admin") {
      where = { user_id: req.user.id };
    }
    const include = [
      {
        model: KategoriKesehatan,
        as: "kategori",
        attributes: ["id", "nama_kategori", "icon_name", "warna"],
      },
      { model: User, as: "pemilik", attributes: ["id", "username"] },
    ];
    const points = await ObjectPoint.findAll({
      where,
      include,
      attributes: [
        "id",
        "nama",
        "alamat",
        "latitude",
        "longitude",
        "kategori_id",
        "atribut_tambahan",
        "is_public",
        "status",
        "alasan_ditolak",
        "user_id",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ status: "success", data: points });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// GET /api/points/explore  (publik – hanya marker Diterima dan publik)
exports.explorePoints = async (req, res) => {
  try {
    const points = await ObjectPoint.findAll({
      where: { is_public: true, status: "Diterima" },
      include: [
        {
          model: KategoriKesehatan,
          as: "kategori",
          attributes: ["id", "nama_kategori", "icon_name", "warna"],
        },
        { model: User, as: "pemilik", attributes: ["username"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ status: "success", data: points });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// POST /api/points
exports.createPoint = async (req, res) => {
  const {
    nama,
    alamat,
    latitude,
    longitude,
    kategori_id,
    atribut_tambahan,
    is_public,
  } = req.body;
  try {
    if (!nama || !latitude || !longitude || !kategori_id)
      return res
        .status(400)
        .json({ message: "Field nama, koordinat, dan kategori wajib diisi" });

    const point = await ObjectPoint.create({
      nama,
      alamat,
      latitude,
      longitude,
      kategori_id,
      atribut_tambahan,
      is_public: is_public !== undefined ? is_public : true,
      status: req.user.role === "admin" ? "Diterima" : "Pending",
      user_id: req.user.id,
    });
    const full = await ObjectPoint.findByPk(point.id, {
      include: [
        { model: KategoriKesehatan, as: "kategori" },
        { model: User, as: "pemilik", attributes: ["username"] },
      ],
    });
    res.json({
      status: "success",
      message: "Point berhasil ditambahkan",
      data: full,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// PUT /api/points/:id
exports.updatePoint = async (req, res) => {
  try {
    const point = await ObjectPoint.findByPk(req.params.id);
    if (!point)
      return res.status(404).json({ message: "Point tidak ditemukan" });

    // Hanya pemilik atau admin yang boleh edit
    if (req.user.role !== "admin" && point.user_id !== req.user.id)
      return res.status(403).json({ message: "Akses ditolak" });

    const {
      nama,
      alamat,
      latitude,
      longitude,
      kategori_id,
      atribut_tambahan,
      is_public,
    } = req.body;

    // Jika user biasa mengedit marker yang Rejected → reset ke Pending & hapus alasan
    const statusUpdate =
      req.user.role !== "admin" && point.status === "Rejected"
        ? { status: "Pending", alasan_ditolak: null }
        : {};

    await point.update({
      nama,
      alamat,
      latitude,
      longitude,
      kategori_id,
      atribut_tambahan,
      is_public: is_public !== undefined ? is_public : point.is_public,
      ...statusUpdate,
    });

    const full = await ObjectPoint.findByPk(point.id, {
      include: [
        { model: KategoriKesehatan, as: "kategori" },
        { model: User, as: "pemilik", attributes: ["username"] },
      ],
    });
    res.json({ status: "success", message: "Point diperbarui", data: full });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// DELETE /api/points/:id
exports.deletePoint = async (req, res) => {
  try {
    const point = await ObjectPoint.findByPk(req.params.id);
    if (!point)
      return res.status(404).json({ message: "Point tidak ditemukan" });

    if (req.user.role !== "admin" && point.user_id !== req.user.id)
      return res.status(403).json({ message: "Akses ditolak" });

    await point.destroy();
    res.json({ status: "success", message: "Point dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};
exports.approvePoint = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Akses ditolak" });

    const point = await ObjectPoint.findByPk(req.params.id);
    if (!point)
      return res.status(404).json({ message: "Point tidak ditemukan" });

    await point.update({ status: "Diterima" });
    res.json({ status: "success", message: "Point disetujui" });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// PUT /api/points/:id/reject  (admin only)
exports.rejectPoint = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Akses ditolak" });

    const point = await ObjectPoint.findByPk(req.params.id);
    if (!point)
      return res.status(404).json({ message: "Point tidak ditemukan" });

    const { alasan_ditolak } = req.body;
    await point.update({
      status: "Rejected",
      alasan_ditolak: alasan_ditolak || null,
    });
    res.json({ status: "success", message: "Point ditolak" });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};
