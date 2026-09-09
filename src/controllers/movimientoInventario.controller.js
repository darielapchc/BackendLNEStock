const movimientoInventarioService = require('../services/movimientoInventario.service');

class MovimientoInventarioController {
  async listarMovimientos(req, res, next) {
    try {
      const movimientos = await movimientoInventarioService.listar();
      res.status(200).json(movimientos);
    } catch (err) {
      next(err);
    }
  }

  async crearMovimiento(req, res, next) {
    try {
      const { tipoMovimiento, cantidad, fecha, productoId } = req.body;
      const movimiento = await movimientoInventarioService.registrar({
        tipoMovimiento,
        cantidad,
        fecha,
        productoId,
        // El usuario se toma del JWT y nunca de un id enviado por el cliente.
        usuarioId: req.user.id,
      });
      res.status(201).json(movimiento);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MovimientoInventarioController();
