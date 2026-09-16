const { Router } = require('express');
const { body, param } = require('express-validator');
const usuarioController = require('../controllers/usuario.controller');
const handleValidationErrors = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/authenticate');

const router = Router();

const validarId = param('id')
  .isInt({ gt: 0 })
  .withMessage('El id debe ser un entero positivo')
  .toInt();

router.get(
  '/',
  authenticate,
  authorize('admin'),
  usuarioController.listarUsuarios
);

router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validarId,
  handleValidationErrors,
  usuarioController.obtenerUsuario
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  [
    validarId,
    body('isActive')
      .isBoolean({ strict: true })
      .withMessage('isActive debe ser true o false'),
  ],
  handleValidationErrors,
  usuarioController.actualizarEstado
);

router.put(
  '/:id/password',
  authenticate,
  authorize('admin'),
  [
    validarId,
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/\d/)
      .withMessage('La contraseña debe incluir al menos un número'),
  ],
  handleValidationErrors,
  usuarioController.restablecerPassword
);

module.exports = router;
