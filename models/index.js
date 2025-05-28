const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Conductor = require('./Conductor');
const HistorialConductor = require('./HistorialConductor');
const Camion = require('./Camion');
const MantenimientoCamion = require('./MantenimientoCamion');
const Ruta = require('./Ruta');
const Pedido = require('./Pedido');
const SeguimientoPedido = require('./SeguimientoPedido');

// Establecer relaciones
function establecerRelaciones() {
  // Relación Conductor - HistorialConductor (1:N)
  Conductor.hasMany(HistorialConductor, {
    foreignKey: 'id_conductor',
    as: 'historial'
  });
  HistorialConductor.belongsTo(Conductor, {
    foreignKey: 'id_conductor',
    as: 'conductor'
  });

  // Relación Camion - MantenimientoCamion (1:N)
  Camion.hasMany(MantenimientoCamion, {
    foreignKey: 'id_camion',
    as: 'mantenimientos'
  });
  MantenimientoCamion.belongsTo(Camion, {
    foreignKey: 'id_camion',
    as: 'camion'
  });

  // Relación Usuario - Pedido (1:N) como cliente
  Usuario.hasMany(Pedido, {
    foreignKey: 'id_cliente',
    as: 'pedidos'
  });
  Pedido.belongsTo(Usuario, {
    foreignKey: 'id_cliente',
    as: 'cliente'
  });

  // Relación Ruta - Pedido (1:N)
  Ruta.hasMany(Pedido, {
    foreignKey: 'id_ruta',
    as: 'pedidos'
  });
  Pedido.belongsTo(Ruta, {
    foreignKey: 'id_ruta',
    as: 'ruta'
  });

  // Relación Camion - Pedido (1:N)
  Camion.hasMany(Pedido, {
    foreignKey: 'id_camion',
    as: 'pedidos'
  });
  Pedido.belongsTo(Camion, {
    foreignKey: 'id_camion',
    as: 'camion'
  });

  // Relación Conductor - Pedido (1:N)
  Conductor.hasMany(Pedido, {
    foreignKey: 'id_conductor',
    as: 'pedidos'
  });
  Pedido.belongsTo(Conductor, {
    foreignKey: 'id_conductor',
    as: 'conductor'
  });

  // Relación Pedido - SeguimientoPedido (1:N)
  Pedido.hasMany(SeguimientoPedido, {
    foreignKey: 'id_pedido',
    as: 'seguimientos'
  });
  SeguimientoPedido.belongsTo(Pedido, {
    foreignKey: 'id_pedido',
    as: 'pedido'
  });
}

module.exports = {
  sequelize,
  Usuario,
  Conductor,
  HistorialConductor,
  Camion,
  MantenimientoCamion,
  Ruta,
  Pedido,
  SeguimientoPedido,
  establecerRelaciones
};