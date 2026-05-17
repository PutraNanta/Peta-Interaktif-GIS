'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    // 1. Hapus data lama di ObjectPoints dulu (karena ada FK)
    await queryInterface.bulkDelete('ObjectPoints', null, {});
    // 2. Hapus data lama MasterTipe
    await queryInterface.bulkDelete('MasterTipes', null, {});

    // 3. Insert MasterTipe: Kesehatan
    await queryInterface.bulkInsert('MasterTipes', [{
      nama_tipe: 'kesehatan',
      warna: '#e74c3c',
      deskripsi: 'Rumpun Fasilitas Kesehatan – meliputi semua jenis sarana dan prasarana kesehatan di Pulau Bali.',
      createdAt: now,
      updatedAt: now
    }]);

    // 4. Dapatkan id MasterTipe yang baru dibuat (asumsi id=1 atau ambil dari DB)
    const [masterTipe] = await queryInterface.sequelize.query(
      `SELECT id FROM "MasterTipes" WHERE nama_tipe = 'kesehatan' LIMIT 1`
    );
    const masterTipeId = masterTipe[0]?.id || 1;

    const rsuFields = JSON.stringify([
      { key: "nama_rs", label: "Nama RS (Identitas)", type: "text", placeholder: "Sesuai izin operasional" },
      { key: "nomor_registrasi", label: "No Registrasi", type: "text", placeholder: "SIRS Kemenkes" },
      { key: "alamat_lengkap", label: "Alamat Lengkap", type: "text", placeholder: "Kec, Kab/Kota, Prov" },
      { key: "telepon", label: "Telepon", type: "text", placeholder: "Kontak Darurat" },
      { key: "website", label: "Website", type: "text" },
      { key: "kelas_rs", label: "Kelas RS", type: "select", options: ["Kelas A", "Kelas B", "Kelas C", "Kelas D", "Kelas D Pratama"] },
      { key: "kepemilikan", label: "Kepemilikan", type: "select", options: ["Pemerintah Pusat", "Pemerintah Daerah", "TNI", "Polri", "Swasta", "BUMN", "BUMD"] },
      { key: "akreditasi", label: "Akreditasi", type: "select", options: ["Paripurna", "Utama", "Madya", "Dasar", "Belum Terakreditasi"] },
      { key: "tahun_berdiri", label: "Tahun Berdiri", type: "number" },
      { key: "luas_lahan", label: "Luas Lahan (m2)", type: "number" },
      { key: "igd_24jam", label: "IGD 24 Jam", type: "select", options: ["Ya", "Tidak"] },
      { key: "level_igd", label: "Level IGD", type: "select", options: ["Level 1 (Dasar)", "Level 2 (Madya)", "Level 3 (Lengkap)"] },
      { key: "kapasitas_tt", label: "Kapasitas Tempat Tidur", type: "number" },
      { key: "kelas_rawat_inap", label: "Kelas Rawat Inap (Pisahkan koma)", type: "text", placeholder: "Kelas 1, VIP, dll" },
      { key: "icu_iccu", label: "Tersedia ICU/ICCU", type: "select", options: ["Ya", "Tidak"] },
      { key: "nicu_picu", label: "Tersedia NICU/PICU", type: "select", options: ["Ya", "Tidak"] },
      { key: "hcu", label: "Tersedia HCU", type: "select", options: ["Ya", "Tidak"] },
      { key: "kamar_operasi", label: "Kamar Operasi", type: "select", options: ["Ya", "Tidak"] },
      { key: "jumlah_kamar_operasi", label: "Jumlah Kamar Operasi", type: "number" },
      { key: "laboratorium", label: "Laboratorium", type: "select", options: ["Tidak Ada", "Dasar", "Lengkap", "Patologi Anatomi"] },
      { key: "radiologi", label: "Layanan Radiologi (Pisahkan koma)", type: "text", placeholder: "USG, CT Scan, dll" },
      { key: "bank_darah", label: "Bank Darah", type: "select", options: ["Ya", "Tidak"] },
      { key: "apotek_rs", label: "Apotek RS", type: "select", options: ["Ya", "Tidak"] },
      { key: "rehabilitasi_medik", label: "Rehabilitasi Medik", type: "select", options: ["Ya", "Tidak"] },
      { key: "hemodialisis", label: "Hemodialisis", type: "select", options: ["Ya", "Tidak"] },
      { key: "spesialis", label: "Daftar Spesialis (Pisahkan koma)", type: "text", placeholder: "Bedah Umum, Paru, dll" },
      { key: "jumlah_spesialis", label: "Jumlah Dokter Spesialis", type: "number" },
      { key: "sub_spesialis", label: "Sub-Spesialis (SpX-K)", type: "select", options: ["Ya", "Tidak"] },
      { key: "bpjs", label: "Menerima BPJS", type: "select", options: ["Ya", "Tidak"] },
      { key: "metode_bayar", label: "Metode Bayar (Pisahkan koma)", type: "text", placeholder: "Tunai, Asuransi, dll" },
      { key: "jam_poliklinik", label: "Jam Poliklinik", type: "text" },
      { key: "pendaftaran_online", label: "Pendaftaran Online", type: "select", options: ["Ya", "Tidak"] },
      { key: "rme", label: "Rekam Medis Elektronik", type: "select", options: ["Ya", "Tidak"] },
      { key: "aksesibilitas", label: "Aksesibilitas (Pisahkan koma)", type: "text", placeholder: "Parkir Luas, Akses Difabel..." },
      { key: "fasilitas_lain", label: "Fasilitas Lain (Pisahkan koma)", type: "text", placeholder: "Kantin, ATM..." }
    ]);

    // 5. Insert 8 KategoriKesehatan
    await queryInterface.bulkInsert('KategoriKesehatans', [
      { nama_kategori: 'Rumah Sakit Umum', icon_name: 'Hospital', warna: '#e74c3c', fields: rsuFields, master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
      { nama_kategori: 'Rumah Sakit Khusus', icon_name: 'Building2', warna: '#c0392b', master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
      { nama_kategori: 'Klinik', icon_name: 'Stethoscope', warna: '#3498db', master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
      { nama_kategori: 'Puskesmas', icon_name: 'HeartPulse', warna: '#27ae60', master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
      { nama_kategori: 'Apotek', icon_name: 'Pill', warna: '#8e44ad', master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
      { nama_kategori: 'Klinik Gigi', icon_name: 'Smile', warna: '#e67e22', master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
      { nama_kategori: 'Bidan & Klinik Bersalin', icon_name: 'Baby', warna: '#e91e8c', master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
      { nama_kategori: 'Fisioterapi & Rehabilitasi', icon_name: 'Activity', warna: '#16a085', master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('KategoriKesehatans', null, {});
    await queryInterface.bulkDelete('MasterTipes', null, {});
  }
};
