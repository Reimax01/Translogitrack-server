const MantenimientoCamion = require('../models/MantenimientoCamion');
const Camion = require('../models/Camion');
const { validationResult } = require('express-validator');

exports.crearMantenimiento = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const camion = await Camion.findByPk(req.params.camionId);
    if (!camion) {
      return res.status(404).json({ mensaje: 'Camión no encontrado' });
    }

    // Cambiar estado del camión
    await camion.update({ estado_operativo: 'En mantenimiento' });

    const mantenimiento = await MantenimientoCamion.create({
      id_camion: req.params.camionId,
      ...req.body
    });

    res.status(201).json(mantenimiento);
  } catch (error) {
    next(error);
  }
};

exports.finalizarMantenimiento = async (req, res, next) => {
  try {
    const mantenimiento = await MantenimientoCamion.findByPk(req.params.mantenimientoId);
    if (!mantenimiento) {
      return res.status(404).json({ mensaje: 'Mantenimiento no encontrado' });
    }

    // Actualizar fecha de fin
    await mantenimiento.update({ fecha_fin: new Date() });

    // Cambiar estado del camión
    const camion = await Camion.findByPk(mantenimiento.id_camion);
    await camion.update({ estado_operativo: 'Disponible' });

    res.json({ mensaje: 'Mantenimiento finalizado correctamente' });
  } catch (error) {
    next(error);
  }
};
exports.obtenerHistorialMantenimiento = async (req, res, next) => {
  try {
    const mantenimiento = await MantenimientoCamion.findAll({
      where: { id_camion: req.params.camionId }
    });
    res.json(mantenimiento);
  } catch (error) {
    next(error);
  }
};