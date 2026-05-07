'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hapus kolom lama
    await queryInterface.removeColumn('ObjectPoints', 'tipe_objek');

    // Tambah kolom baru
    await queryInterface.addColumn('ObjectPoints', 'kategori_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'KategoriKesehatans', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('ObjectPoints', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ObjectPoints', 'kategori_id');
    await queryInterface.removeColumn('ObjectPoints', 'user_id');
    await queryInterface.addColumn('ObjectPoints', 'tipe_objek', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'kesehatan'
    });
  }
};
