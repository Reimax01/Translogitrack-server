const Usuario = require('../models/Usuario');
const { validationResult } = require('express-validator');

exports.listarUsuarios = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rol } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { activo: true };
    if (rol) where.rol = rol;
    
    const { count, rows } = await Usuario.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['contrasena_hash'] },
      order: [['id_usuario', 'ASC']]
    });
    
    res.json({
      total: count,
      pagina: parseInt(page),
      porPagina: parseInt(limit),
      usuarios: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['contrasena_hash'] }
    });
    
    if (!usuario || !usuario.activo) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

exports.crearUsuario = async (req, res, next) => {
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
      rol
    });

    // Excluir la contraseña en la respuesta
    const usuarioResponse = nuevoUsuario.toJSON();
    delete usuarioResponse.contrasena_hash;
    
    res.status(201).json(usuarioResponse);
  } catch (error) {
    next(error);
  }
};

exports.actualizarUsuario = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // No permitir actualizar el correo electrónico
    if (req.body.correo_electronico && req.body.correo_electronico !== usuario.correo_electronico) {
      return res.status(400).json({ mensaje: 'No se puede cambiar el correo electrónico' });
    }

    // Preparar datos para actualizar
    const datosActualizar = { ...req.body };
    if (datosActualizar.contrasena) {
      datosActualizar.contrasena_hash = datosActualizar.contrasena;
      delete datosActualizar.contrasena;
    } else {
      delete datosActualizar.contrasena_hash;
    }

    await usuario.update(datosActualizar);
    
    // Excluir la contraseña en la respuesta
    const usuarioResponse = usuario.toJSON();
    delete usuarioResponse.contrasena_hash;
    
    res.json(usuarioResponse);
  } catch (error) {
    next(error);
  }
};

exports.eliminarUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // No permitir eliminarse a sí mismo
    if (usuario.id_usuario === req.usuario.id) {
      return res.status(400).json({ mensaje: 'No puedes desactivar tu propia cuenta' });
    }

    // Eliminación lógica
    await usuario.update({ activo: false });
    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};