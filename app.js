const express = require('express');
const cors = require('cors');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { sequelize, establecerRelaciones } = require('./models');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// Configuración de Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middlewares
app.use(cors());
app.use(express.json());

// Establecer relaciones entre modelos
establecerRelaciones();

// Importar todas las rutas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const conductorRoutes = require('./routes/conductorRoutes');
const camionRoutes = require('./routes/camionRoutes');
const rutaRoutes = require('./routes/rutaRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const historialConductorRoutes = require('./routes/historialConductorRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const seguimientoRoutes = require('./routes/seguimientoRoutes');

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/conductores', conductorRoutes);
app.use('/api/camiones', camionRoutes);
app.use('/api/rutas', rutaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api', historialConductorRoutes);
app.use('/api', mantenimientoRoutes);
app.use('/api', seguimientoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de TransLogiTrack');
});

// Manejo de errores
app.use(errorMiddleware);

// Sincronizar modelos con la base de datos
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos sincronizada');
    
    // Inicialización del servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });

module.exports = app;