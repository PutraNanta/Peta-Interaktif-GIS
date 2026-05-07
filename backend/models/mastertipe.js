'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MasterTipe extends Model {
    static associate(models) {
      MasterTipe.hasMany(models.KategoriKesehatan, { foreignKey: 'master_tipe_id', as: 'kategori' });
    }
  }
  MasterTipe.init({
    nama_tipe: { type: DataTypes.STRING, allowNull: false },
    warna: { type: DataTypes.STRING },
    deskripsi: { type: DataTypes.TEXT }
  }, { sequelize, modelName: 'MasterTipe' });
  return MasterTipe;
};