function manejadorErrores(err, req, res, next) {
  console.error(err.stack);
  
  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      mensaje: 'Error de validación',
      errores: err.errors.map(e => ({
        campo: e.path,
        mensaje: e.message
      }))
    });
  }
  
  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      mensaje: 'Error en la base de datos',
      errores: err.errors.map(e => ({
        campo: e.path,
        mensaje: e.message
      }))
    });
  }
  
  // Error JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ mensaje: 'Token expirado' });
  }
  
  // Error por defecto
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}

module.exports = manejadorErrores;