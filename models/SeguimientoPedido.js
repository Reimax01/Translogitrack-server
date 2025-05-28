const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SeguimientoPedido = sequelize.define('SeguimientoPedido', {
  id_seguimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ubicacion: {
    type: DataTypes.JSONB
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'En tránsito', 'Entregado', 'Cancelado'),
    allowNull: false
  }
}, {
  tableName: 'seguimientopedido',
  timestamps: false
});

module.exports = SeguimientoPedido;