const Pedido = require('../models/Pedido');
const Camion = require("../models/Camion");
const Conductor = require("../models/Conductor");
const Ruta = require("../models/Ruta");
const Usuario = require("../models/Usuario");
const SeguimientoPedido = require('../models/SeguimientoPedido');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.listarPedidos = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, fechaInicio, fechaFin, id_cliente } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (estado) where.estado = estado;
    if (id_cliente) where.id_cliente = id_cliente;
    
    if (fechaInicio || fechaFin) {
      where.fecha_creacion = {};
      if (fechaInicio) where.fecha_creacion[Op.gte] = new Date(fechaInicio);
      if (fechaFin) where.fecha_creacion[Op.lte] = new Date(fechaFin);
    }
    
    const { count, rows } = await Pedido.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_creacion', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['id_usuario', 'nombre_completo', 'correo_electronico']
        },
        {
          model: Ruta,
          as: 'ruta',
          attributes: ['id_ruta', 'origen', 'destino', 'distancia_km']
        },
        {
          model: Camion,
          as: 'camion',
          attributes: ['id_camion', 'placa', 'capacidad_kg']
        },
        {
          model: Conductor,
          as: 'conductor',
          attributes: ['id_conductor', 'nombre_completo', 'numero_licencia']
        },
        {
          model: SeguimientoPedido,
          as: 'seguimientos',
          required: false,
          order: [['timestamp', 'DESC']],
          limit: 1
        }
      ]
    });
    
    res.json({
      total: count,
      pagina: parseInt(page),
      porPagina: parseInt(limit),
      pedidos: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['id_usuario', 'nombre_completo', 'correo_electronico']
        },
        {
          model: Ruta,
          as: 'ruta',
          attributes: ['id_ruta', 'origen', 'destino', 'distancia_km']
        },
        {
          model: Camion,
          as: 'camion',
          attributes: ['id_camion', 'placa', 'capacidad_kg']
        },
        {
          model: Conductor,
          as: 'conductor',
          attributes: ['id_conductor', 'nombre_completo', 'numero_licencia']
        },
        {
          model: SeguimientoPedido,
          as: 'seguimientos',
          required: false,
          order: [['timestamp', 'DESC']]
        }
      ]
    });
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

exports.crearPedido = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id_ruta, id_camion, id_conductor, ...datosPedido } = req.body;
    
    // Verificar disponibilidad del camión y conductor
    const camion = await Camion.findByPk(id_camion);
    if (!camion || camion.estado_operativo !== 'Disponible') {
      return res.status(400).json({ mensaje: 'El camión no está disponible' });
    }

    const conductor = await Conductor.findByPk(id_conductor);
    if (!conductor || !conductor.activo) {
      return res.status(400).json({ mensaje: 'El conductor no está disponible' });
    }

    const ruta = await Ruta.findByPk(id_ruta);
    if (!ruta) {
      return res.status(404).json({ mensaje: 'Ruta no encontrada' });
    }

    // Crear el pedido
    const nuevoPedido = await Pedido.create({
      ...datosPedido,
      id_cliente: req.usuario.id,
      id_ruta,
      id_camion,
      id_conductor,
      estado: 'Pendiente'
    });

    // Cambiar estado del camión a "Asignado"
    await camion.update({ estado_operativo: 'Asignado' });

    // Crear primer seguimiento
    await SeguimientoPedido.create({
      id_pedido: nuevoPedido.id_pedido,
      estado: 'Pendiente'
    });
    
    res.status(201).json(nuevoPedido);
  } catch (error) {
    next(error);
  }
};

exports.actualizarPedido = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pedido = await Pedido.findByPk(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Solo permitir actualizar ciertos campos
    const { estado, observaciones, fecha_entrega_real } = req.body;
    
    if (estado && estado !== pedido.estado) {
      // Registrar cambio de estado en el seguimiento
      await SeguimientoPedido.create({
        id_pedido: pedido.id_pedido,
        estado,
        ubicacion: pedido.camion?.ubicacion_actual
      });

      // Si el pedido se marca como entregado o cancelado, liberar el camión
      if (estado === 'Entregado' || estado === 'Cancelado') {
        const camion = await Camion.findByPk(pedido.id_camion);
        if (camion) {
          await camion.update({ estado_operativo: 'Disponible' });
        }
      }
    }
    
    await pedido.update({
      estado: estado || pedido.estado,
      observaciones: observaciones || pedido.observaciones,
      fecha_entrega_real: fecha_entrega_real || pedido.fecha_entrega_real
    });
    
    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

exports.eliminarPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Solo permitir eliminar pedidos en estado Pendiente
    if (pedido.estado !== 'Pendiente') {
      return res.status(400).json({ mensaje: 'Solo se pueden eliminar pedidos en estado Pendiente' });
    }

    // Liberar el camión si estaba asignado
    if (pedido.id_camion) {
      const camion = await Camion.findByPk(pedido.id_camion);
      if (camion) {
        await camion.update({ estado_operativo: 'Disponible' });
      }
    }
    
    await pedido.destroy();
    res.json({ mensaje: 'Pedido eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

exports.actualizarUbicacion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [{
        model: Camion,
        as: 'camion',
        required: true
      }]
    });
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Solo permitir actualización de ubicación para pedidos en tránsito
    if (pedido.estado !== 'En tránsito') {
      return res.status(400).json({ mensaje: 'Solo se puede actualizar ubicación para pedidos en tránsito' });
    }

    const { latitud, longitud } = req.body;
    
    // Actualizar ubicación del camión
    await pedido.camion.update({
      ubicacion_actual: { latitud, longitud }
    });

    // Registrar en el seguimiento
    await SeguimientoPedido.create({
      id_pedido: pedido.id_pedido,
      estado: 'En tránsito',
      ubicacion: { latitud, longitud }
    });
    
    res.json({ mensaje: 'Ubicación actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};    