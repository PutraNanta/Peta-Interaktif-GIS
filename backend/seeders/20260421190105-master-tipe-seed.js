'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('MasterTipes', [
      { nama_tipe: 'rumah', warna: 'blue', createdAt: new Date(), updatedAt: new Date() },
      { nama_tipe: 'kantor', warna: 'grey', createdAt: new Date(), updatedAt: new Date() },
      { nama_tipe: 'kesehatan', warna: 'red', createdAt: new Date(), updatedAt: new Date() },
      { nama_tipe: 'pendidikan', warna: 'green', createdAt: new Date(), updatedAt: new Date() },
      { nama_tipe: 'restauran', warna: 'orange', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('MasterTipes', null, {});
  }
};
