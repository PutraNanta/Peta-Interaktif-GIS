"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ObjectPoint extends Model {
    static associate(models) {
      ObjectPoint.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "pemilik",
      });
      ObjectPoint.belongsTo(models.KategoriKesehatan, {
        foreignKey: "kategori_id",
        as: "kategori",
      });
    }
  }
  ObjectPoint.init(
    {
      nama: { type: DataTypes.STRING, allowNull: false },
      alamat: { type: DataTypes.TEXT },
      latitude: { type: DataTypes.DOUBLE, allowNull: false },
      longitude: { type: DataTypes.DOUBLE, allowNull: false },
      kategori_id: { type: DataTypes.INTEGER, allowNull: true },
      atribut_tambahan: { type: DataTypes.JSON, allowNull: true },
      is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      status: {
        type: DataTypes.ENUM("Pending", "Diterima", "Rejected"),
        allowNull: false,
        defaultValue: "Pending",
      },
      alasan_ditolak: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      foto_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    { sequelize, modelName: "ObjectPoint" },
  );
  return ObjectPoint;
};
