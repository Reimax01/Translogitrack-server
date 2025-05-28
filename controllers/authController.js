const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { validationResult } = require('express-validator');

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id_usuario,
      nombre: usuario.nombre_completo,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { correo_electronico, contrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo_electronico } });
    
    if (!usuario || !(await usuario.validarContrasena(contrasena))) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta desactivada' });
    }

    const token = generarToken(usuario);
    
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
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

    const token = generarToken(nuevoUsuario);
    
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

    // Generar token para recuperación (expira en 1 hora)
    const token = jwt.sign(
      { id: usuario.id_usuario, action: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Enviar correo con el token (implementación real requeriría un servicio de email)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    // Aquí iría el código para enviar el correo electrónico
    console.log(`Enlace para restablecer contraseña: ${resetLink}`);
    
    res.json({ mensaje: 'Se ha enviado un enlace para restablecer la contraseña a tu correo electrónico' });
  } catch (error) {
    next(error);
  }
};

exports.resetearContrasena = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, nueva_contrasena } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.action !== 'password_reset') {
      return res.status(400).json({ mensaje: 'Token inválido' });
    }

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Actualizar contraseña (el hook beforeUpdate se encargará del hashing)
    await usuario.update({ contrasena_hash: nueva_contrasena });
    
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ mensaje: 'El enlace ha expirado' });
    }
    next(error);
  }
};