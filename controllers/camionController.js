const Camion = require('../models/Camion');
const MantenimientoCamion = require('../models/MantenimientoCamion');
const { validationResult } = require('express-validator');

exports.listarCamiones = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, activo } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (estado) where.estado_operativo = estado;
    if (activo !== undefined) where.activo = activo === 'true';
    
    const { count, rows } = await Camion.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id_camion', 'ASC']],
      include: [{
        model: MantenimientoCamion,
        as: 'mantenimientos',
        required: false,
        where: { fecha_fin: null }, // Solo mantenimientos activos
        order: [['fecha_inicio', 'DESC']]
      }]
    });
    
    res.json({
      total: count,
      pagina: parseInt(page),
      porPagina: parseInt(limit),
      camiones: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerCamion = async (req, res, next) => {
  try {
    const camion = await Camion.findByPk(req.params.id, {
      include: [{
        model: MantenimientoCamion,
        as: 'mantenimientos',
        required: false,
        order: [['fecha_inicio', 'DESC']]
      }]
    });
    
    if (!camion) {
      return res.status(404).json({ mensaje: 'Camión no encontrado' });
    }
    
    res.json(camion);
  } catch (error) {
    next(error);
  }
};

exports.crearCamion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const camionExistente = await Camion.findOne({ where: { placa: req.body.placa } });
    
    if (camionExistente) {
      return res.status(400).json({ mensaje: 'La placa ya está registrada' });
    }

    const nuevoCamion = await Camion.create(req.body);
    res.status(201).json(nuevoCamion);
  } catch (error) {
    next(error);
  }
};

exports.actualizarCamion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const camion = await Camion.findByPk(req.params.id);
    
    if (!camion) {
      return res.status(404).json({ mensaje: 'Camión no encontrado' });
    }
    
    // Verificar si la placa ya existe (para otro camión)
    if (req.body.placa && req.body.placa !== camion.placa) {
      const placaExistente = await Camion.findOne({ where: { placa: req.body.placa } });
      
      if (placaExistente) {
        return res.status(400).json({ mensaje: 'La placa ya está en uso por otro camión' });
      }
    }

    await camion.update(req.body);
    res.json(camion);
  } catch (error) {
    next(error);
  }
};

exports.eliminarCamion = async (req, res, next) => {
  try {
    const camion = await Camion.findByPk(req.params.id);
    
    if (!camion) {
      return res.status(404).json({ mensaje: 'Camión no encontrado' });
    }
    
    // Eliminación lógica
    await camion.update({ activo: false });
    res.json({ mensaje: 'Camión desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.agregarMantenimiento = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const camion = await Camion.findByPk(req.params.id);
    
    if (!camion) {
      return res.status(404).json({ mensaje: 'Camión no encontrado' });
    }

    // Cambiar estado del camión a "En mantenimiento"
    await camion.update({ estado_operativo: 'En mantenimiento' });

    const nuevoMantenimiento = await MantenimientoCamion.create({
      id_camion: camion.id_camion,
      ...req.body
    });
    
    res.status(201).json(nuevoMantenimiento);
  } catch (error) {
    next(error);
  }
};

exports.finalizarMantenimiento = async (req, res, next) => {
  try {
    const mantenimiento = await MantenimientoCamion.findByPk(req.params.idMantenimiento);
    
    if (!mantenimiento) {
      return res.status(404).json({ mensaje: 'Mantenimiento no encontrado' });
    }

    if (mantenimiento.fecha_fin) {
      return res.status(400).json({ mensaje: 'El mantenimiento ya fue finalizado' });
    }

    // Actualizar fecha de fin
    await mantenimiento.update({ 
      fecha_fin: req.body.fecha_fin || new Date().toISOString().split('T')[0],
      km: req.body.km
    });

    // Cambiar estado del camión a "Disponible"
    const camion = await Camion.findByPk(mantenimiento.id_camion);
    await camion.update({ 
      estado_operativo: 'Disponible',
      km_actual: req.body.km || camion.km_actual
    });
    
    res.json(mantenimiento);
  } catch (error) {
    next(error);
  }
};

exports.obtenerMantenimientos = async (req, res, next) => {
  try {
    const mantenimientos = await MantenimientoCamion.findAll({
      where: { id_camion: req.params.id },
      order: [['fecha_inicio', 'DESC']]
    });
    
    res.json(mantenimientos);
  } catch (error) {
    next(error);
  }
};