const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const rutaController = require('../controllers/rutaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador', 'Cliente')
], rutaController.listarRutas);

router.get('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador', 'Cliente')
], rutaController.obtenerRuta);

router.post('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('origen', 'El origen es obligatorio').not().isEmpty(),
  check('destino', 'El destino es obligatorio').not().isEmpty(),
  check('distancia_km', 'La distancia es obligatoria y debe ser un número').isDecimal()
], rutaController.crearRuta);

router.put('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador'),
  check('origen', 'El origen es obligatorio').not().isEmpty(),
  check('destino', 'El destino es obligatorio').not().isEmpty(),
  check('distancia_km', 'La distancia es obligatoria y debe ser un número').isDecimal()
], rutaController.actualizarRuta);

router.delete('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], rutaController.eliminarRuta);

module.exports = router;