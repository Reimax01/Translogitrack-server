const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialConductor = sequelize.define('HistorialConductor', {
  id_historial: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo_evento: {
    type: DataTypes.ENUM('sanción', 'premio', 'incidente'),
    allowNull: false
  },
  fecha_evento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'historialConductor',
  timestamps: false
});

module.exports = HistorialConductor;