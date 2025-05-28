const Conductor = require('../models/Conductor');
const HistorialConductor = require('../models/HistorialConductor');
const { validationResult } = require('express-validator');

exports.listarConductores = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, activo } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    
    const { count, rows } = await Conductor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id_conductor', 'ASC']],
      include: [{
        model: HistorialConductor,
        as: 'historial',
        required: false
      }]
    });
    
    res.json({
      total: count,
      pagina: parseInt(page),
      porPagina: parseInt(limit),
      conductores: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerConductor = async (req, res, next) => {
  try {
    const conductor = await Conductor.findByPk(req.params.id, {
      include: [{
        model: HistorialConductor,
        as: 'historial',
        required: false
      }]
    });
    
    if (!conductor) {
      return res.status(404).json({ mensaje: 'Conductor no encontrado' });
    }
    
    res.json(conductor);
  } catch (error) {
    next(error);
  }
};

exports.crearConductor = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const conductorExistente = await Conductor.findOne({ 
      where: { numero_licencia: req.body.numero_licencia } 
    });
    
    if (conductorExistente) {
      return res.status(400).json({ mensaje: 'El número de licencia ya está registrado' });
    }

    const nuevoConductor = await Conductor.create(req.body);
    res.status(201).json(nuevoConductor);
  } catch (error) {
    next(error);
  }
};

exports.actualizarConductor = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const conductor = await Conductor.findByPk(req.params.id);
    
    if (!conductor) {
      return res.status(404).json({ mensaje: 'Conductor no encontrado' });
    }
    
    // Verificar si el número de licencia ya existe (para otro conductor)
    if (req.body.numero_licencia && req.body.numero_licencia !== conductor.numero_licencia) {
      const licenciaExistente = await Conductor.findOne({ 
        where: { numero_licencia: req.body.numero_licencia } 
      });
      
      if (licenciaExistente) {
        return res.status(400).json({ mensaje: 'El número de licencia ya está en uso por otro conductor' });
      }
    }

    await conductor.update(req.body);
    res.json(conductor);
  } catch (error) {
    next(error);
  }
};

exports.eliminarConductor = async (req, res, next) => {
  try {
    const conductor = await Conductor.findByPk(req.params.id);
    
    if (!conductor) {
      return res.status(404).json({ mensaje: 'Conductor no encontrado' });
    }
    
    // Eliminación lógica
    await conductor.update({ activo: false });
    res.json({ mensaje: 'Conductor desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.agregarHistorialConductor = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const conductor = await Conductor.findByPk(req.params.id);
    
    if (!conductor) {
      return res.status(404).json({ mensaje: 'Conductor no encontrado' });
    }

    const nuevoHistorial = await HistorialConductor.create({
      id_conductor: conductor.id_conductor,
      ...req.body
    });
    
    res.status(201).json(nuevoHistorial);
  } catch (error) {
    next(error);
  }
};

exports.obtenerHistorialConductor = async (req, res, next) => {
  try {
    const historiales = await HistorialConductor.findAll({
      where: { id_conductor: req.params.id },
      order: [['fecha_evento', 'DESC']]
    });
    
    res.json(historiales);
  } catch (error) {
    next(error);
  }
};
