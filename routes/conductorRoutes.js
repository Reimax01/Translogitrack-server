const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const conductorController = require('../controllers/conductorController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], conductorController.listarConductores);

router.get('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], conductorController.obtenerConductor);

router.post('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('nombre_completo', 'El nombre completo es obligatorio').not().isEmpty(),
  check('numero_licencia', 'El número de licencia es obligatorio').not().isEmpty(),
  check('fecha_vencimiento_licencia', 'La fecha de vencimiento es obligatoria').isDate()
], conductorController.crearConductor);

router.put('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('nombre_completo', 'El nombre completo es obligatorio').not().isEmpty(),
  check('numero_licencia', 'El número de licencia es obligatorio').not().isEmpty(),
  check('fecha_vencimiento_licencia', 'La fecha de vencimiento es obligatoria').isDate()
], conductorController.actualizarConductor);

router.delete('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], conductorController.eliminarConductor);

router.post('/:id/historial', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
  check('tipo_evento', 'El tipo de evento es obligatorio').isIn(['sanción', 'premio', 'incidente']),
  check('fecha_evento', 'La fecha del evento es obligatoria').isDate()
], conductorController.agregarHistorialConductor);

module.exports = router;