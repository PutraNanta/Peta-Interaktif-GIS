'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ObjectPoint extends Model {
    static associate(models) {
      // define association here
    }
  }
  ObjectPoint.init({
    nama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alamat: DataTypes.TEXT,
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    tipe_objek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    atribut_tambahan: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Virtual field for icon URL based on tipe_objek
    iconUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const type = this.getDataValue('tipe_objek');
        // Konfigurasi icon bisa disesuaikan dengan folder assets frontend atau public folder backend
        const iconPaths = {
          rumah: '/icons/rumah.png',
          kantor: '/icons/kantor.png',
          rs: '/icons/rs.png',
          sekolah: '/icons/sekolah.png'
        };
        return iconPaths[type] || '/icons/default.png';
      }
    }
  }, {
    sequelize,
    modelName: 'ObjectPoint',
  });
  return ObjectPoint;
};
