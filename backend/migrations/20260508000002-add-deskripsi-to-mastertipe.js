'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('MasterTipes', 'deskripsi', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('MasterTipes', 'deskripsi');
  }
};
