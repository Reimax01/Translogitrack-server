const express = require('express');
const cors = require('cors');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { sequelize, establecerRelaciones } = require('./models');
const errorMiddleware = require('./middlewares/errorMiddleware');
const path = require('path');

// Manejo global de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

const app = express();

// Configuración de Swagger
let swaggerDocument;
try {
  swaggerDocument = YAML.load(path.resolve(__dirname, 'swagger.yaml'));
} catch (err) {
  console.error('Error cargando swagger.yaml:', err.message);
  process.exit(1);
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middlewares
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://translogitrack-frontend.web.app'
  ],
  credentials: true, // si usas tokens o cookies
};

app.use(cors(corsOptions));

app.use(express.json());

// Establecer relaciones entre modelos
establecerRelaciones();

// Importar rutas
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

// Sincronización de BD y arranque del servidor
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos sincronizada');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
  });

module.exports = app;
