const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const historialController = require('../controllers/historialConductorController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/conductores/:conductorId/historial', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('descripcion', 'La descripción es obligatoria').notEmpty(),
  check('tipo_evento', 'Tipo de evento inválido').isIn(['sanción', 'premio', 'incidente']),
  check('fecha_evento', 'Fecha inválida').isDate()
], historialController.crearHistorial);

router.get('/conductores/:conductorId/historial', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], historialController.obtenerHistorial);

module.exports = router;