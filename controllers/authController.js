const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const { generarToken, verificarToken } = require('../utils/jwt');
const { enviarEmailRecuperacion } = require('../services/emailService');
const bcrypt = require('bcryptjs');

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { correo_electronico, contrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo_electronico } });

    if (!usuario || !(await usuario.validarContrasena(contrasena))) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta desactivada' });
    }

    const token = generarToken({
      id: usuario.id_usuario,
      nombre: usuario.nombre_completo,
      rol: usuario.rol
    });

    res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_completo,
        rol: usuario.rol,
        correo: usuario.correo_electronico
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.registro = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { nombre_completo, correo_electronico, contrasena, rol } = req.body;

    const usuarioExistente = await Usuario.findOne({ where: { correo_electronico } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
    }

    const nuevoUsuario = await Usuario.create({
      nombre_completo,
      correo_electronico,
      contrasena_hash: contrasena,
      rol: rol || 'Cliente'
    });

    const token = generarToken({
      id: nuevoUsuario.id_usuario,
      nombre: nuevoUsuario.nombre_completo,
      rol: nuevoUsuario.rol
    });

    res.status(201).json({
      token,
      usuario: {
        id: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre_completo,
        rol: nuevoUsuario.rol,
        correo: nuevoUsuario.correo_electronico
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.recuperarContrasena = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { correo_electronico } = req.body;
    const usuario = await Usuario.findOne({ where: { correo_electronico } });
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Correo electrónico no registrado' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, action: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await enviarEmailRecuperacion(correo_electronico, token);

    res.json({ mensaje: 'Se ha enviado un enlace para restablecer la contraseña a tu correo electrónico' });
  } catch (error) {
    next(error);
  }
};

exports.resetearContrasena = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { token, nuevaContrasena } = req.body;
    const decoded = verificarToken(token);

    if (decoded.action !== 'password_reset') {
      return res.status(400).json({ mensaje: 'Token inválido' });
    }

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Encriptar la nueva contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    await usuario.update({ contrasena_hash: hashedPassword });

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ mensaje: 'El enlace ha expirado' });
    }
    next(error);
  }
};