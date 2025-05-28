const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id_pedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'En tránsito', 'Entregado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_entrega_estimada: {
    type: DataTypes.DATE
  },
  fecha_entrega_real: {
    type: DataTypes.DATE
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2)
  },
  nro_guia: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'pedido',
  timestamps: false
});

module.exports = Pedido;