const { check } = require('express-validator');
const { Usuario, Conductor, Camion, Ruta } = require('../models');

// Validaciones comunes
const validacionesComunes = {
  correoElectronico: check('correo_electronico')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  contrasena: check('contrasena')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  nombreCompleto: check('nombre_completo')
    .notEmpty()
    .withMessage('El nombre completo es obligatorio')
    .trim()
    .escape(),
  
  rolUsuario: check('rol')
    .isIn(['Administrador', 'Operador', 'Cliente'])
    .withMessage('Rol no válido')
};

// Validaciones para usuarios
const validacionesUsuario = {
  crearUsuario: [
    validacionesComunes.nombreCompleto,
    validacionesComunes.correoElectronico,
    validacionesComunes.contrasena,
    validacionesComunes.rolUsuario,
    check('correo_electronico').custom(async value => {
      const usuario = await Usuario.findOne({ where: { correo_electronico: value } });
      if (usuario) {
        throw new Error('El correo electrónico ya está registrado');
      }
    })
  ],
  
  actualizarUsuario: [
    validacionesComunes.nombreCompleto,
    validacionesComunes.correoElectronico,
    validacionesComunes.rolUsuario,
    check('id').isInt().withMessage('ID inválido')
  ]
};

// Validaciones para conductores
const validacionesConductor = {
  crearConductor: [
    validacionesComunes.nombreCompleto,
    check('numero_licencia')
      .notEmpty()
      .withMessage('El número de licencia es obligatorio'),
    check('fecha_vencimiento_licencia')
      .isDate()
      .withMessage('Fecha de vencimiento inválida')
      .custom(value => {
        if (new Date(value) < new Date()) {
          throw new Error('La licencia está vencida');
        }
        return true;
      })
  ]
};

// Validaciones para camiones
const validacionesCamion = {
  crearCamion: [
    check('placa')
      .notEmpty()
      .withMessage('La placa es obligatoria')
      .isAlphanumeric()
      .withMessage('La placa solo puede contener letras y números')
      .custom(async value => {
        const camion = await Camion.findOne({ where: { placa: value } });
        if (camion) {
          throw new Error('La placa ya está registrada');
        }
      }),
    check('capacidad_kg')
      .isInt({ min: 1 })
      .withMessage('La capacidad debe ser un número positivo'),
    check('estado_operativo')
      .isIn(['Disponible', 'En mantenimiento', 'Asignado'])
      .withMessage('Estado operativo no válido')
  ]
};

// Validaciones para rutas
const validacionesRuta = {
  crearRuta: [
    check('origen')
      .notEmpty()
      .withMessage('El origen es obligatorio'),
    check('destino')
      .notEmpty()
      .withMessage('El destino es obligatorio'),
    check('distancia_km')
      .isFloat({ min: 0.1 })
      .withMessage('La distancia debe ser un número positivo'),
    check('origen').custom(async (value, { req }) => {
      const rutaExistente = await Ruta.findOne({ 
        where: { 
          origen: value,
          destino: req.body.destino 
        } 
      });
      if (rutaExistente) {
        throw new Error('Ya existe una ruta con este origen y destino');
      }
    })
  ]
};

// Validaciones para pedidos
const validacionesPedido = {
  crearPedido: [
    check('id_ruta')
      .isInt()
      .withMessage('ID de ruta inválido')
      .custom(async value => {
        const ruta = await Ruta.findByPk(value);
        if (!ruta) {
          throw new Error('Ruta no encontrada');
        }
      }),
    check('id_camion')
      .isInt()
      .withMessage('ID de camión inválido')
      .custom(async value => {
        const camion = await Camion.findByPk(value);
        if (!camion || camion.estado_operativo !== 'Disponible') {
          throw new Error('Camión no disponible');
        }
      }),
    check('id_conductor')
      .isInt()
      .withMessage('ID de conductor inválido')
      .custom(async value => {
        const conductor = await Conductor.findByPk(value);
        if (!conductor || !conductor.activo) {
          throw new Error('Conductor no disponible');
        }
      }),
    check('fecha_entrega_estimada')
      .isISO8601()
      .withMessage('Fecha estimada de entrega inválida')
      .custom(value => {
        if (new Date(value) < new Date()) {
          throw new Error('La fecha estimada no puede ser en el pasado');
        }
        return true;
      })
  ]
};

module.exports = {
  ...validacionesComunes,
  ...validacionesUsuario,
  ...validacionesConductor,
  ...validacionesCamion,
  ...validacionesRuta,
  ...validacionesPedido
};