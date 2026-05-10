"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("ObjectPoints", "status", {
      type: Sequelize.ENUM("Pending", "Diterima", "Rejected"),
      allowNull: false,
      defaultValue: "Pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ObjectPoints", "status");
  },
};
