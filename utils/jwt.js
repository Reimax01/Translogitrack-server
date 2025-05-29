const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT con los datos del usuario.
 * @param {Object} payload - Información a incluir en el token.
 * @param {String} [expiresIn='8h'] - Tiempo de expiración (por defecto 8 horas).
 * @returns {String} Token firmado.
 */
const generarToken = (payload, expiresIn = '8h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verifica un token JWT y devuelve su contenido si es válido.
 * @param {String} token - Token JWT a verificar.
 * @returns {Object} Payload decodificado.
 * @throws {Error} Si el token no es válido o ha expirado.
 */
const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generarToken,
  verificarToken
};
