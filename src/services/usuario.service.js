const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const { hashPassword } = require('../utils/password');

class UsuarioService {
  async listUsers() {
    return userRepository.findAllSafe();
  }

  async getUserById(id) {
    const user = await userRepository.findSafeById(id);
    if (!user) throw this._error('Usuario no encontrado', 404);
    return user;
  }

  async updateUserStatus(id, isActive, requesterId) {
    const user = await userRepository.findById(id);
    if (!user) throw this._error('Usuario no encontrado', 404);

    if (requesterId === user.id && isActive === false) {
      throw this._error('No puedes desactivarte a ti mismo', 400);
    }

    await userRepository.updateStatus(user, isActive);

    if (isActive === false) {
      await refreshTokenRepository.revokeAllForUser(user.id);
    }

    return this.getUserById(user.id);
  }

  async resetUserPassword(id, password) {
    const user = await userRepository.findById(id);
    if (!user) throw this._error('Usuario no encontrado', 404);

    const passwordHash = await hashPassword(password);
    await userRepository.updatePassword(user, passwordHash);
    await refreshTokenRepository.revokeAllForUser(user.id);
  }

  _error(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }
}

module.exports = new UsuarioService();
