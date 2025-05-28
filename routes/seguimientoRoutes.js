const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const seguimientoController = require('../controllers/seguimientoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/pedidos/:pedidoId/seguimientos', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('estado', 'Estado inválido').optional().isIn(['Pendiente', 'En tránsito', 'Entregado', 'Cancelado']),
  check('ubicacion', 'Ubicación inválida').optional().isObject()
], seguimientoController.registrarSeguimiento);

router.get('/pedidos/:pedidoId/seguimientos', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador', 'Cliente')
], seguimientoController.obtenerSeguimientos);

module.exports = router;