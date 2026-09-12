const { Router } = require('express');
const { body } = require('express-validator');
const movimientoInventarioController = require('../controllers/movimientoInventario.controller');
const handleValidationErrors = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/authenticate');

const router = Router();

router.get('/', authenticate, movimientoInventarioController.listarMovimientos);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('tipoMovimiento').isIn(['ENTRADA', 'SALIDA'])
      .withMessage('tipoMovimiento debe ser ENTRADA o SALIDA'),
    body('cantidad').isInt({ gt: 0 }).withMessage('La cantidad debe ser un entero mayor que cero').toInt(),
    body('productoId').isInt({ gt: 0 }).withMessage('productoId debe ser un entero positivo').toInt(),
    body('fecha').optional().isISO8601().withMessage('La fecha debe tener formato ISO 8601').toDate(),
  ],
  handleValidationErrors,
  movimientoInventarioController.crearMovimiento
);

module.exports = router;
