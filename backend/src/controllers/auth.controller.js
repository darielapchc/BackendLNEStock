const authService = require('../services/auth.service');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// El Controller es "delgado" a propósito (thin controller). Su único
// trabajo es: leer el request, llamar al Service correcto, y decidir
// el status code + forma de la respuesta. CERO lógica de negocio aquí.
// Si ves un "if" que decide reglas de negocio dentro de un controller,
// es una señal de alerta (code smell) -- esa lógica debería vivir en
// el Service.
// -----------------------------------------------------------------------

// httpOnly + secure + sameSite: la defensa estándar contra robo de
// cookies vía XSS y CSRF. El JS del navegador NO puede leer esta cookie.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días, en ms
  path: '/api/auth', // solo se envía en rutas de auth, no en toda la app
};

class AuthController {
  async register(req, res, next) {
    try {
      const { fullName, email, password, role } = req.body;
      const { accessToken, refreshToken, user } = await authService.register({
        fullName,
        email,
        password,
        role,
      });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json({ accessToken, user });
    } catch (err) {
      next(err); // delegamos al middleware centralizado de errores
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await authService.login({
        email,
        password,
        userAgent: req.headers['user-agent'],
      });

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken, user });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const oldRefreshToken = req.cookies?.refreshToken;
      if (!oldRefreshToken) {
        return res.status(401).json({ message: 'No hay sesión activa' });
      }

      const { accessToken, refreshToken, user } = await authService.refresh(
        oldRefreshToken
      );

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken, user });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
