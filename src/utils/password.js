const bcrypt = require('bcrypt');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// "Salt rounds" = cuántas veces se aplica el algoritmo de hashing.
// Más rounds = más lento de calcular = más difícil de romper por fuerza
// bruta, pero también más lento para el login legítimo. 10-12 es el
// estándar de la industria en 2026 para balancear seguridad y rendimiento.
// -----------------------------------------------------------------------
const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

module.exports = { hashPassword, comparePassword };
