const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MantenimientoCamion = sequelize.define('MantenimientoCamion', {
  id_mantenimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('preventivo', 'correctivo'),
    allowNull: false
  },
  km: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'mantenimientocamion',
  timestamps: false
});

module.exports = MantenimientoCamion;