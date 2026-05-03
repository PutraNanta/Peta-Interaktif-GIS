'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MasterTipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MasterTipe.init({
    nama_tipe: DataTypes.STRING,
    warna: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MasterTipe',
  });
  return MasterTipe;
};