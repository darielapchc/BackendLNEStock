const { Router } = require('express');
const { body } = require('express-validator');
const productoController = require('../controllers/producto.controller');
const handleValidationErrors = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/authenticate');

const router = Router();

const validarProductoCrear = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 150 }).withMessage('El nombre no puede superar los 150 caracteres'),
  body('descripcion').optional({ checkFalsy: true }).trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede superar los 500 caracteres'),
  body('codigo').trim().notEmpty().withMessage('El código es obligatorio')
    .isLength({ max: 100 }).withMessage('El código no puede superar los 100 caracteres'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número igual o mayor que cero').toFloat(),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un entero igual o mayor que cero').toInt(),
  body('imagen').optional({ checkFalsy: true }).trim()
    .isLength({ max: 500 }).withMessage('La imagen no puede superar los 500 caracteres'),
  body('categoriaId').isInt({ gt: 0 }).withMessage('categoriaId debe ser un entero positivo').toInt(),
];

const validarProductoActualizar = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío')
    .isLength({ max: 150 }).withMessage('El nombre no puede superar los 150 caracteres'),
  body('descripcion').optional({ checkFalsy: true }).trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede superar los 500 caracteres'),
  body('codigo').optional().trim().notEmpty().withMessage('El código no puede quedar vacío')
    .isLength({ max: 100 }).withMessage('El código no puede superar los 100 caracteres'),
  body('precio').optional().isFloat({ min: 0 })
    .withMessage('El precio debe ser un número igual o mayor que cero').toFloat(),
  body('imagen').optional({ checkFalsy: true }).trim()
    .isLength({ max: 500 }).withMessage('La imagen no puede superar los 500 caracteres'),
  body('categoriaId').optional().isInt({ gt: 0 })
    .withMessage('categoriaId debe ser un entero positivo').toInt(),
];

router.get('/', authenticate, productoController.listarProductos);
router.get('/:id', authenticate, productoController.obtenerProducto);
router.post('/', authenticate, authorize('admin'), validarProductoCrear, handleValidationErrors, productoController.crearProducto);
router.put('/:id', authenticate, authorize('admin'), validarProductoActualizar, handleValidationErrors, productoController.actualizarProducto);
router.delete('/:id', authenticate, authorize('admin'), productoController.eliminarProducto);

module.exports = router;
