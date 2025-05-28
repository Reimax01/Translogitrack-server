const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const mantenimientoController = require('../controllers/mantenimientoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/camiones/:camionId/mantenimientos', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('fecha_inicio', 'Fecha de inicio requerida').isDate(),
  check('descripcion', 'Descripción requerida').notEmpty(),
  check('tipo', 'Tipo de mantenimiento inválido').isIn(['preventivo', 'correctivo'])
], mantenimientoController.crearMantenimiento);

router.put('/mantenimientos/:mantenimientoId/finalizar', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], mantenimientoController.finalizarMantenimiento);

module.exports = router;