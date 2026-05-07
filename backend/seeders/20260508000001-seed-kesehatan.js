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

    // 5. Insert 8 KategoriKesehatan
    await queryInterface.bulkInsert('KategoriKesehatans', [
      { nama_kategori: 'Rumah Sakit Umum', icon_name: 'Hospital', warna: '#e74c3c', master_tipe_id: masterTipeId, createdAt: now, updatedAt: now },
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
