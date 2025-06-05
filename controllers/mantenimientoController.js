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
      ...req.body,
      km: null // Inicialmente null, se llenará al finalizar
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

    // Verificar que el mantenimiento no esté ya finalizado
    if (mantenimiento.fecha_fin) {
      return res.status(400).json({ mensaje: 'El mantenimiento ya está finalizado' });
    }

    // Obtener el camión para capturar el kilometraje actual
    const camion = await Camion.findByPk(mantenimiento.id_camion);
    if (!camion) {
      return res.status(404).json({ mensaje: 'Camión no encontrado' });
    }

    // Actualizar mantenimiento con fecha de fin y kilometraje actual
    await mantenimiento.update({ 
      fecha_fin: new Date(),
      km: camion.km_actual || 0 // Capturar el kilometraje actual del camión
    });

    // Cambiar estado del camión a disponible
    await camion.update({ estado_operativo: 'Disponible' });

    res.json({ 
      mensaje: 'Mantenimiento finalizado correctamente',
      km_registrado: camion.km_actual || 0
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerHistorialMantenimiento = async (req, res, next) => {
  try {
    const mantenimiento = await MantenimientoCamion.findAll({
      where: { id_camion: req.params.camionId },
      order: [['fecha_inicio', 'DESC']]
    });
    res.json(mantenimiento);
  } catch (error) {
    next(error);
  }
};