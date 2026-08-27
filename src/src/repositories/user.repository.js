const User = require('../models/user.model');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// El Repository es la ÚNICA capa que sabe que existe Sequelize.
// El Service (lógica de negocio) no debería importar "User" directamente
// desde Sequelize -- así, si en el futuro cambiamos el ORM, solo
// reescribimos este archivo, y el resto del sistema ni se entera.
// Esto es el patrón Repository + el principio de Inversión de Dependencias (SOLID).
// -----------------------------------------------------------------------
class UserRepository {
  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findById(id) {
    return User.findByPk(id);
  }

  async create({ fullName, email, passwordHash, role }) {
    return User.create({ fullName, email, passwordHash, role });
  }
}

module.exports = new UserRepository();
