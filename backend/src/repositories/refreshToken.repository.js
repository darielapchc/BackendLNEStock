const RefreshToken = require('../models/refreshToken.model');
const { Op } = require('sequelize');

class RefreshTokenRepository {
  async create({ token, userId, expiresAt, userAgent }) {
    return RefreshToken.create({ token, userId, expiresAt, userAgent });
  }

  async findValidToken(token) {
    // "Válido" = existe, no expiró, y no fue revocado.
    return RefreshToken.findOne({
      where: {
        token,
        revokedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
  }

  async revokeToken(token) {
    return RefreshToken.update(
      { revokedAt: new Date() },
      { where: { token } }
    );
  }

  // Útil para el botón "cerrar sesión en todos los dispositivos"
  async revokeAllForUser(userId) {
    return RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } }
    );
  }
}

module.exports = new RefreshTokenRepository();
