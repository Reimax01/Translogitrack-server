const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Camion = sequelize.define('Camion', {
  id_camion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  placa: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  capacidad_kg: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado_operativo: {
    type: DataTypes.ENUM('Disponible', 'En mantenimiento', 'Asignado'),
    allowNull: false,
    defaultValue: 'Disponible'
  },
  ubicacion_actual: {
    type: DataTypes.JSONB
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  km_actual: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'camion',
  timestamps: false
});

module.exports = Camion;