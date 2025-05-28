const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ruta = sequelize.define('Ruta', {
  id_ruta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  origen: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destino: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre_destino: {
    type: DataTypes.STRING
  },
  distancia_km: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tiempo_estimado_min: {
    type: DataTypes.INTEGER
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'ruta',
  timestamps: false
});

module.exports = Ruta;