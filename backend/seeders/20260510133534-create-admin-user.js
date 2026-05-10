"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await queryInterface.bulkInsert(
      "Users",
      [
        {
          username: "admin",
          email: "admin@test.com",
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", { email: "admin@test.com" }, {});
  },
};
