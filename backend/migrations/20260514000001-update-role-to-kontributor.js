'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // In PostgreSQL, to change ENUM to VARCHAR, we use RAW SQL.
    await queryInterface.sequelize.query('ALTER TABLE "Users" ALTER COLUMN "role" TYPE VARCHAR(255) USING role::text;');
    // Update existing 'user' roles to 'kontributor'
    await queryInterface.sequelize.query(`UPDATE "Users" SET role = 'kontributor' WHERE role = 'user';`);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`UPDATE "Users" SET role = 'user' WHERE role = 'kontributor';`);
    await queryInterface.sequelize.query('ALTER TABLE "Users" ALTER COLUMN "role" TYPE "enum_Users_role" USING role::"enum_Users_role";');
  }
};
