const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], usuarioController.listarUsuarios);

router.get('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador', 'Operador')
], usuarioController.obtenerUsuario);

router.post('/', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador'),
  check('nombre_completo', 'El nombre completo es obligatorio').not().isEmpty(),
  check('correo_electronico', 'El correo electrónico es obligatorio').isEmail(),
  check('contrasena', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  check('rol', 'El rol es obligatorio').isIn(['Administrador', 'Operador', 'Cliente'])
], usuarioController.crearUsuario);

router.put('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador'),
  check('nombre_completo', 'El nombre completo es obligatorio').not().isEmpty(),
  check('correo_electronico', 'El correo electrónico es obligatorio').isEmail(),
  check('rol', 'El rol es obligatorio').isIn(['Administrador', 'Operador', 'Cliente'])
], usuarioController.actualizarUsuario);

router.delete('/:id', [
  authMiddleware.verificarToken,
  authMiddleware.autorizarRol('Administrador')
], usuarioController.eliminarUsuario);

module.exports = router;