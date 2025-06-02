const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    // Railway no requiere SSL en desarrollo local,
    // pero en producción podrías activarlo así:
    // ssl: { require: true, rejectUnauthorized: false },
  },
  define: {
    freezeTableName: true,
    underscored: true,
    schema: 'public'
  }
});

module.exports = sequelize;
