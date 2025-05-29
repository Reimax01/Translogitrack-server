const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_completo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correo_electronico: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  contrasena_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('Administrador', 'Operador', 'Cliente'),
    allowNull: false
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuario',
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      if (!usuario.contrasena_hash.startsWith('$2a$')) {
        await hashearContrasena(usuario);
      }
      usuario.correo_electronico = usuario.correo_electronico.toLowerCase();
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('contrasena_hash')) {
        // Solo hashear si no parece ya un hash bcrypt
        if (!usuario.contrasena_hash.startsWith('$2a$')) {
          await hashearContrasena(usuario);
        }
      }
      if (usuario.changed('correo_electronico')) {
        usuario.correo_electronico = usuario.correo_electronico.toLowerCase();
      }
    }
  }
});

async function hashearContrasena(usuario) {
  const salt = await bcrypt.genSalt(10);
  usuario.contrasena_hash = await bcrypt.hash(usuario.contrasena_hash, salt);
}
// Agregar método para validar contraseña
Usuario.prototype.validarContrasena = async function (contrasena) {
  try {
    return await bcrypt.compare(contrasena, this.contrasena_hash);
  } catch (err) {
    console.error('Error al validar la contraseña:', err);
    return false;
  }
};

exports.resetearContrasena = async (req, res, next) => {
  // Validación de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { token, nueva_contrasena } = req.body;
    const decoded = verificarToken(token);

    if (decoded.action !== 'password_reset') {
      return res.status(400).json({ mensaje: 'Token inválido' });
    }

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Aquí es donde usas la línea para hashear la contraseña nueva
    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);

    // Guardas el hash en la base de datos
    await usuario.update({ contrasena_hash: hashedPassword });

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ mensaje: 'El enlace ha expirado' });
    }
    next(error);
  }
};


module.exports = Usuario;
