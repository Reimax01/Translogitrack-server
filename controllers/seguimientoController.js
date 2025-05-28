const SeguimientoPedido = require('../models/SeguimientoPedido');
const Pedido = require('../models/Pedido');
const { validationResult } = require('express-validator');

exports.registrarSeguimiento = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pedido = await Pedido.findByPk(req.params.pedidoId);
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    const seguimiento = await SeguimientoPedido.create({
      id_pedido: req.params.pedidoId,
      estado: req.body.estado || pedido.estado,
      ubicacion: req.body.ubicacion,
      timestamp: new Date()
    });

    // Actualizar estado del pedido si es diferente
    if (req.body.estado && req.body.estado !== pedido.estado) {
      await pedido.update({ estado: req.body.estado });
    }

    res.status(201).json(seguimiento);
  } catch (error) {
    next(error);
  }
};

exports.obtenerSeguimientos = async (req, res, next) => {
  try {
    const seguimientos = await SeguimientoPedido.findAll({
      where: { id_pedido: req.params.pedidoId },
      order: [['timestamp', 'DESC']]
    });
    res.json(seguimientos);
  } catch (error) {
    next(error);
  }
};