'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class KategoriKesehatan extends Model {
    static associate(models) {
      KategoriKesehatan.belongsTo(models.MasterTipe, { foreignKey: 'master_tipe_id', as: 'rumpun' });
      KategoriKesehatan.hasMany(models.ObjectPoint, { foreignKey: 'kategori_id', as: 'points' });
    }
  }
  KategoriKesehatan.init({
    nama_kategori: { type: DataTypes.STRING, allowNull: false },
    icon_name: { type: DataTypes.STRING },
    warna: { type: DataTypes.STRING },
    master_tipe_id: { type: DataTypes.INTEGER, allowNull: false }
  }, { sequelize, modelName: 'KategoriKesehatan' });
  return KategoriKesehatan;
};
