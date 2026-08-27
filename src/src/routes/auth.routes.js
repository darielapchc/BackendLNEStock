const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const handleValidationErrors = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');
const authService = require('../services/auth.service');

const router = Router();

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Las reglas de validación viven junto a la ruta porque son parte del
// "contrato" del endpoint: es lo primero que alguien leyendo el archivo
// de rutas necesita saber sobre qué espera recibir la API.
// -----------------------------------------------------------------------

router.post(
  '/register',
  [
    body('fullName')
      .trim()
      .notEmpty().withMessage('El nombre completo es obligatorio')
      .isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres'),
    body('email')
      .trim()
      .isEmail().withMessage('Debe ser un correo válido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/\d/).withMessage('La contraseña debe incluir al menos un número'),
    body('role')
      .isIn(['client', 'provider']).withMessage('Rol inválido'),
    // OJO: "admin" NUNCA es un valor permitido aquí -- nadie se
    // auto-asigna admin desde un formulario público. Eso se hace
    // manualmente en BD o desde un panel interno protegido.
  ],
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Debe ser un correo válido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  handleValidationErrors,
  authController.login
);

router.post('/refresh', authController.refresh);

router.post('/logout', authController.logout);

// Ruta de ejemplo protegida, para probar el middleware `authenticate`
// en esta misma sesión (el estudiante debe poder verificar que el
// flujo completo funciona de punta a punta).
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const userRepository = require('../repositories/user.repository');
    const user = await userRepository.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
