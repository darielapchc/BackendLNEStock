const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// El Service NO sabe qué es "req" ni "res". No sabe que existe Express.
// Solo conoce reglas de negocio: "un usuario no puede registrarse dos
// veces con el mismo correo", "las credenciales deben ser válidas para
// iniciar sesión", etc. Esto permite, por ejemplo, reusar este mismo
// Service si mañana exponemos la API por gRPC en lugar de REST, o si
// queremos testear la lógica sin levantar un servidor HTTP.
// -----------------------------------------------------------------------
class AuthService {
  async register({ fullName, email, password, role }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      // Lanzamos errores de dominio, no respuestas HTTP.
      // El Controller decide cómo traducir esto a un status code.
      const error = new Error('El correo ya está registrado');
      error.statusCode = 409; // Conflict
      throw error;
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({
      fullName,
      email,
      passwordHash,
      role,
    });

    return this._issueTokens(user);
  }

  async login({ email, password, userAgent }) {
    const user = await userRepository.findByEmail(email);

    // OJO: mensaje de error genérico a propósito. Si dijéramos
    // "el correo no existe" vs "la contraseña es incorrecta", le
    // regalamos a un atacante la capacidad de enumerar qué correos
    // están registrados en el sistema (user enumeration attack).
    const invalidCredentialsError = () => {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      return err;
    };

    if (!user) throw invalidCredentialsError();

    if (!user.isActive) throw invalidCredentialsError();

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) throw invalidCredentialsError();

    return this._issueTokens(user, userAgent);
  }

  async refresh(oldRefreshToken) {
    // 1. Verificamos la firma y expiración del JWT en sí mismo.
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      const error = new Error('Refresh token inválido o expirado');
      error.statusCode = 401;
      throw error;
    }

    // 2. Verificamos que además siga vigente en nuestra BD
    //    (no haya sido revocado por un logout previo).
    const storedToken = await refreshTokenRepository.findValidToken(oldRefreshToken);
    if (!storedToken) {
      const error = new Error('La sesión fue revocada, inicia sesión de nuevo');
      error.statusCode = 401;
      throw error;
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      await refreshTokenRepository.revokeToken(oldRefreshToken);
      const error = new Error('La sesion ya no pertenece a un usuario activo');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      await refreshTokenRepository.revokeToken(oldRefreshToken);
      const error = new Error('La sesion ya no pertenece a un usuario activo');
      error.statusCode = 401;
      throw error;
    }

    // 3. Rotación: revocamos el refreshToken usado y emitimos uno nuevo.
    // Esto limita el daño si un refreshToken es robado: solo sirve UNA vez.
    await refreshTokenRepository.revokeToken(oldRefreshToken);

    return this._issueTokens(user);
  }

  async logout(refreshToken) {
    await refreshTokenRepository.revokeToken(refreshToken);
  }

  async logoutAllDevices(userId) {
    await refreshTokenRepository.revokeAllForUser(userId);
  }

  async obtenerPerfil(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return this._perfilPublico(user);
  }

  async actualizarPerfil(userId, { fullName, email }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const duplicate = await userRepository.findByEmailExcluyendoId(email, userId);
    if (duplicate) {
      const error = new Error('El correo ya esta registrado');
      error.statusCode = 409;
      throw error;
    }

    try {
      await userRepository.update(user, { fullName, email });
      return this._perfilPublico(user);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        const error = new Error('El correo ya esta registrado');
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  }

  // Método privado (por convención de nombre) reutilizado por
  // register, login y refresh -- evita duplicar esta lógica 3 veces.
  async _issueTokens(user, userAgent) {
    const accessToken = generateAccessToken(user);
    const { token: refreshToken, expiresAt } = generateRefreshToken(user);

    await refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  _perfilPublico(user) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }
}

module.exports = new AuthService();
