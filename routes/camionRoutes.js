const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const camionController = require('../controllers/camionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], camionController.listarCamiones);

router.get('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], camionController.obtenerCamion);

router.post('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('placa', 'La placa es obligatoria').not().isEmpty(),
  check('capacidad_kg', 'La capacidad es obligatoria y debe ser un número').isInt({ min: 1 }),
  check('estado_operativo', 'El estado operativo es obligatorio').isIn(['Disponible', 'En mantenimiento', 'Asignado'])
], camionController.crearCamion);

router.put('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('placa', 'La placa es obligatoria').not().isEmpty(),
  check('capacidad_kg', 'La capacidad es obligatoria y debe ser un número').isInt({ min: 1 }),
  check('estado_operativo', 'El estado operativo es obligatorio').isIn(['Disponible', 'En mantenimiento', 'Asignado'])
], camionController.actualizarCamion);

router.delete('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], camionController.eliminarCamion);

router.post('/:id/mantenimientos', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('fecha_inicio', 'La fecha de inicio es obligatoria').isDate(),
  check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
  check('tipo', 'El tipo de mantenimiento es obligatorio').isIn(['preventivo', 'correctivo'])
], camionController.agregarMantenimiento);

router.put('/:id/mantenimientos/:idMantenimiento/finalizar', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], camionController.finalizarMantenimiento);

module.exports = router;