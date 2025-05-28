const HistorialConductor = require('../models/HistorialConductor');
const Conductor = require('../models/Conductor');
const { validationResult } = require('express-validator');

exports.crearHistorial = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const conductor = await Conductor.findByPk(req.params.conductorId);
    if (!conductor) {
      return res.status(404).json({ mensaje: 'Conductor no encontrado' });
    }

    const nuevoHistorial = await HistorialConductor.create({
      id_conductor: req.params.conductorId,
      ...req.body
    });

    res.status(201).json(nuevoHistorial);
  } catch (error) {
    next(error);
  }
};

exports.obtenerHistorial = async (req, res, next) => {
  try {
    const historial = await HistorialConductor.findAll({
      where: { id_conductor: req.params.conductorId },
      order: [['fecha_evento', 'DESC']]
    });
    res.json(historial);
  } catch (error) {
    next(error);
  }
};