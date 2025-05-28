const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador', 'Cliente')
], pedidoController.listarPedidos);

router.get('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador', 'Cliente')
], pedidoController.obtenerPedido);

router.post('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Cliente', 'Administrador', 'Operador'),
  check('id_ruta', 'La ruta es obligatoria').isInt(),
  check('id_camion', 'El camión es obligatorio').isInt(),
  check('id_conductor', 'El conductor es obligatorio').isInt(),
  check('fecha_entrega_estimada', 'La fecha estimada de entrega es obligatoria').isISO8601()
], pedidoController.crearPedido);

router.put('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('estado', 'El estado debe ser válido').optional().isIn(['Pendiente', 'En tránsito', 'Entregado', 'Cancelado']),
  check('fecha_entrega_real', 'La fecha real de entrega debe ser válida').optional().isISO8601()
], pedidoController.actualizarPedido);

router.delete('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], pedidoController.eliminarPedido);

router.post('/:id/ubicacion', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('latitud', 'La latitud es obligatoria').isDecimal(),
  check('longitud', 'La longitud es obligatoria').isDecimal()
], pedidoController.actualizarUbicacion);

module.exports = router;