const { KategoriKesehatan, MasterTipe } = require("../models");

const CATEGORY_FIELDS = {
  "Rumah Sakit Umum": [
    {
      key: "kelas_rs",
      label: "Kelas RS",
      type: "select",
      options: ["A", "B", "C", "D"],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Negeri", "Swasta"],
    },
    { key: "igd", label: "IGD", type: "select", options: ["Ya", "Tidak"] },
    { key: "spesialisasi", label: "Spesialisasi", type: "text" },
    { key: "fasilitas", label: "Fasilitas", type: "text" },
    { key: "kapasitas_tt", label: "Kapasitas TT", type: "number" },
    { key: "bpjs", label: "BPJS", type: "select", options: ["Ya", "Tidak"] },
    { key: "jam_operasional", label: "Jam Operasional", type: "text" },
    { key: "telepon", label: "Telepon", type: "text" },
  ],
  "Rumah Sakit Khusus": [
    {
      key: "jenis_spesialisasi",
      label: "Jenis Spesialisasi",
      type: "select",
      options: ["Jiwa", "Ibu & Anak", "Kanker", "Bedah", "Gigi"],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Negeri", "Swasta"],
    },
    { key: "igd", label: "IGD", type: "select", options: ["Ya", "Tidak"] },
    { key: "bpjs", label: "BPJS", type: "select", options: ["Ya", "Tidak"] },
    { key: "jam_operasional", label: "Jam Operasional", type: "text" },
    { key: "telepon", label: "Telepon", type: "text" },
  ],
  Klinik: [
    {
      key: "jenis_klinik",
      label: "Jenis Klinik",
      type: "select",
      options: ["Pratama", "Utama"],
    },
    { key: "layanan", label: "Layanan", type: "text" },
    { key: "jenis_dokter", label: "Jenis Dokter", type: "text" },
    { key: "bpjs", label: "BPJS", type: "select", options: ["Ya", "Tidak"] },
    { key: "jam_operasional", label: "Jam Operasional", type: "text" },
    { key: "hari_buka", label: "Hari Buka", type: "text" },
    { key: "telepon", label: "Telepon", type: "text" },
  ],
  Puskesmas: [
    {
      key: "jenis",
      label: "Jenis",
      type: "select",
      options: ["Induk", "Pembantu", "Keliling"],
    },
    { key: "wilayah_kerja", label: "Wilayah Kerja", type: "text" },
    {
      key: "rawat_inap",
      label: "Rawat Inap",
      type: "select",
      options: ["Ya", "Tidak"],
    },
    { key: "bpjs", label: "BPJS", type: "select", options: ["Ya", "Tidak"] },
    {
      key: "tersedia_bidan",
      label: "Tersedia Bidan",
      type: "select",
      options: ["Ya", "Tidak"],
    },
    { key: "jam_operasional", label: "Jam Operasional", type: "text" },
    { key: "telepon", label: "Telepon", type: "text" },
  ],
  Apotek: [
    {
      key: "jaringan",
      label: "Jaringan Apotek",
      type: "select",
      options: ["Kimia Farma", "K24", "Guardian", "Mandiri", "Lainnya"],
    },
    { key: "apoteker", label: "Apoteker", type: "text" },
    {
      key: "drive_thru",
      label: "Drive Thru",
      type: "select",
      options: ["Ya", "Tidak"],
    },
    {
      key: "buka_24_jam",
      label: "Buka 24 Jam",
      type: "select",
      options: ["Ya", "Tidak"],
    },
    { key: "jam_operasional", label: "Jam Operasional", type: "text" },
    { key: "telepon", label: "Telepon", type: "text" },
  ],
  "Klinik Gigi": [
    { key: "layanan_gigi", label: "Layanan Gigi", type: "text" },
    { key: "bpjs", label: "BPJS", type: "select", options: ["Ya", "Tidak"] },
    { key: "nama_dokter", label: "Nama Dokter", type: "text" },
    { key: "jam_operasional", label: "Jam Operasional", type: "text" },
    { key: "telepon", label: "Telepon", type: "text" },
  ],
  "Bidan & Klinik Bersalin": [
    { key: "layanan_bidan", label: "Layanan Bidan", type: "text" },
    { key: "bpjs", label: "BPJS", type: "select", options: ["Ya", "Tidak"] },
    {
      key: "buka_24_jam",
      label: "Buka 24 Jam",
      type: "select",
      options: ["Ya", "Tidak"],
    },
    { key: "jam_operasional", label: "Jam Operasional", type: "text" },
    { key: "telepon", label: "Telepon", type: "text" },
  ],
  "Fisioterapi & Rehabilitasi": [
    {
      key: "spesialisasi_rehab",
      label: "Spesialisasi Rehab",
      type: "select",
      options: ["Fisioterapi", "Napza", "Geriatri"],
    },
    { key: "bpjs", label: "BPJS", type: "select", options: ["Ya", "Tidak"] },
    { key: "jam_operasional", label: "Jam Operasional", type: "text" },
    { key: "telepon", label: "Telepon", type: "text" },
  ],
};

// GET /api/kategori
exports.getAllKategori = async (req, res) => {
  try {
    const kategori = await KategoriKesehatan.findAll({
      include: [
        {
          model: MasterTipe,
          as: "rumpun",
          attributes: ["nama_tipe", "deskripsi"],
        },
      ],
      order: [["id", "ASC"]],
    });
    const result = kategori.map((kat) => ({
      ...kat.toJSON(),
      fields: CATEGORY_FIELDS[kat.nama_kategori] || [],
    }));
    res.json({ status: "success", data: result });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};
