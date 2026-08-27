const jwt = require('jsonwebtoken');
require('dotenv').config();

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Dos secretos DISTINTOS para access y refresh. ¿Por qué? Si el secreto
// del accessToken se filtrara, un atacante podría firmar tokens falsos
// de corta duración -- grave, pero limitado en el tiempo. Si compartiera
// secreto con el refreshToken, el atacante podría generar sesiones
// "eternas". Separar los secretos limita el radio de explosión (blast
// radius) de una fuga de credenciales.
// -----------------------------------------------------------------------
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

function generateAccessToken(user) {
  // Payload minimalista a propósito: el JWT NO está encriptado, solo
  // firmado -- cualquiera puede leer su contenido (pruébalo en jwt.io).
  // Nunca metemos aquí passwordHash, ni datos sensibles.
  return jwt.sign(
    { sub: user.id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  const token = jwt.sign(
    { sub: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: `${REFRESH_TOKEN_EXPIRES_IN_DAYS}d` }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

  return { token, expiresAt };
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
