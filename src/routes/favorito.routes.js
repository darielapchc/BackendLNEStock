const { Router } = require('express');
const { param } = require('express-validator');
const favoritoController = require('../controllers/favorito.controller');
const handleValidationErrors = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');

const router = Router();

const validarProductoId = [
  param('productoId')
    .isInt({ gt: 0 })
    .withMessage('productoId debe ser un entero positivo')
    .toInt(),
];

router.get('/', authenticate, favoritoController.listarFavoritos);
router.post(
  '/:productoId',
  authenticate,
  validarProductoId,
  handleValidationErrors,
  favoritoController.crearFavorito
);
router.delete(
  '/:productoId',
  authenticate,
  validarProductoId,
  handleValidationErrors,
  favoritoController.eliminarFavorito
);

module.exports = router;
