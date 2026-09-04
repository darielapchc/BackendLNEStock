const { verifyAccessToken } = require('../utils/jwt');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Este middleware se coloca delante de cualquier ruta protegida
// (ej: "ver mi perfil", "crear una solicitud de servicio"). Lee el
// accessToken del header Authorization, lo verifica, y si es válido,
// "inyecta" al usuario en req.user para que el resto del pipeline
// (Controller, Service) sepa quién está haciendo la petición.
//
// Formato esperado del header: "Authorization: Bearer <token>"
// -----------------------------------------------------------------------
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    // Distinguimos expirado de inválido -- el frontend usa esto para
    // decidir si debe intentar /auth/refresh automáticamente o mandar
    // al usuario de vuelta al login.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// -----------------------------------------------------------------------
// Middleware adicional para autorización por rol (RBAC básico).
// Ejemplo de uso: router.get('/admin/stats', authenticate, authorize('admin'), ...)
// -----------------------------------------------------------------------
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
