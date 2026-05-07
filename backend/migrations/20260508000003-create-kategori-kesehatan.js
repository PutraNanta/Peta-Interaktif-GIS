'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('KategoriKesehatans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_kategori: {
        type: Sequelize.STRING,
        allowNull: false
      },
      icon_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      warna: {
        type: Sequelize.STRING,
        allowNull: true
      },
      master_tipe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'MasterTipes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('KategoriKesehatans');
  }
};
