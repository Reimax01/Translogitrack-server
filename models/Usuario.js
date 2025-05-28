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
    validate: {
      isEmail: true
    }
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
      if (usuario.contrasena_hash) {
        const salt = await bcrypt.genSalt(10);
        usuario.contrasena_hash = await bcrypt.hash(usuario.contrasena_hash, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('contrasena_hash')) {
        const salt = await bcrypt.genSalt(10);
        usuario.contrasena_hash = await bcrypt.hash(usuario.contrasena_hash, salt);
      }
    }
  }
});

Usuario.prototype.validarContrasena = async function(contrasena) {
  return await bcrypt.compare(contrasena, this.contrasena_hash);
};

module.exports = Usuario;