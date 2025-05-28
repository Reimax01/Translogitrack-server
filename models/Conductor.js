const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conductor = sequelize.define('Conductor', {
  id_conductor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_completo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numero_licencia: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fecha_vencimiento_licencia: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'conductor',
  timestamps: false
});

module.exports = Conductor;