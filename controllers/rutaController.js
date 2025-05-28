const Ruta = require('../models/Ruta');
const Pedido = require('../models/Pedido');
const { validationResult } = require('express-validator');

exports.listarRutas = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Ruta.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id_ruta', 'ASC']]
    });
    
    res.json({
      total: count,
      pagina: parseInt(page),
      porPagina: parseInt(limit),
      rutas: rows
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerRuta = async (req, res, next) => {
  try {
    const ruta = await Ruta.findByPk(req.params.id);
    
    if (!ruta) {
      return res.status(404).json({ mensaje: 'Ruta no encontrada' });
    }
    
    res.json(ruta);
  } catch (error) {
    next(error);
  }
};

exports.crearRuta = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verificar si ya existe una ruta con el mismo origen y destino
    const rutaExistente = await Ruta.findOne({ 
      where: { 
        origen: req.body.origen,
        destino: req.body.destino
      } 
    });
    
    if (rutaExistente) {
      return res.status(400).json({ mensaje: 'Ya existe una ruta con el mismo origen y destino' });
    }

    const nuevaRuta = await Ruta.create(req.body);
    res.status(201).json(nuevaRuta);
  } catch (error) {
    next(error);
  }
};

exports.actualizarRuta = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const ruta = await Ruta.findByPk(req.params.id);
    
    if (!ruta) {
      return res.status(404).json({ mensaje: 'Ruta no encontrada' });
    }
    
    // Verificar si los cambios crearían un duplicado
    if ((req.body.origen && req.body.origen !== ruta.origen) || 
        (req.body.destino && req.body.destino !== ruta.destino)) {
      const origen = req.body.origen || ruta.origen;
      const destino = req.body.destino || ruta.destino;
      
      const rutaExistente = await Ruta.findOne({ 
        where: { 
          origen,
          destino,
          id_ruta: { [Op.ne]: ruta.id_ruta } // Excluir la ruta actual
        } 
      });
      
      if (rutaExistente) {
        return res.status(400).json({ mensaje: 'Ya existe otra ruta con el mismo origen y destino' });
      }
    }

    await ruta.update(req.body);
    res.json(ruta);
  } catch (error) {
    next(error);
  }
};

exports.eliminarRuta = async (req, res, next) => {
  try {
    const ruta = await Ruta.findByPk(req.params.id);
    
    if (!ruta) {
      return res.status(404).json({ mensaje: 'Ruta no encontrada' });
    }
    
    // Verificar si la ruta está asociada a algún pedido
    const pedidosAsociados = await Pedido.count({ where: { id_ruta: ruta.id_ruta } });
    if (pedidosAsociados > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede eliminar la ruta porque está asociada a pedidos existentes' 
      });
    }

    await ruta.destroy();
    res.json({ mensaje: 'Ruta eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};