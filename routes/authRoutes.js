const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

router.post('/login', [
  check('correo_electronico', 'El correo electrónico es obligatorio').isEmail(),
  check('contrasena', 'La contraseña es obligatoria').not().isEmpty()
], authController.login);

router.post('/registro', [
  check('nombre_completo', 'El nombre completo es obligatorio').not().isEmpty(),
  check('correo_electronico', 'El correo electrónico es obligatorio').isEmail(),
  check('contrasena', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  check('rol', 'El rol es obligatorio').isIn(['Administrador', 'Operador', 'Cliente'])
], authController.registro);

router.post('/recuperar-contrasena', [
  check('correo_electronico', 'El correo electrónico es obligatorio').isEmail()
], authController.recuperarContrasena);

router.post('/reset-password', [
  check('token', 'El token es obligatorio').not().isEmpty(),
  check('nuevaContrasena', 'La nueva contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
], authController.resetearContrasena);

module.exports = router;