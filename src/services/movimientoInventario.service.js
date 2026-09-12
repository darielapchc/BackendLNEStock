const userRepository = require('../repositories/user.repository');
const productoRepository = require('../repositories/producto.repository');
const movimientoInventarioRepository = require('../repositories/movimientoInventario.repository');

// Las entradas y salidas se resuelven en una única transacción. Con el
// bloqueo del producto evitamos que dos salidas simultáneas usen el mismo
// stock disponible y terminen dejando una existencia negativa.
class MovimientoInventarioService {
  async listar() {
    return movimientoInventarioRepository.findAll();
  }

  async registrar({ tipoMovimiento, cantidad, fecha, productoId, usuarioId }) {
    if (!['ENTRADA', 'SALIDA'].includes(tipoMovimiento)) {
      throw this._error('El tipo de movimiento debe ser ENTRADA o SALIDA', 400);
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw this._error('La cantidad debe ser un entero mayor que cero', 400);
    }

    const usuario = await userRepository.findById(usuarioId);
    if (!usuario) throw this._error('Usuario no encontrado', 404);

    try {
      return await movimientoInventarioRepository.ejecutarEnTransaccion(
        async (transaction) => {
          const producto = await productoRepository.findById(productoId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          });

          if (!producto) throw this._error('Producto no encontrado', 404);

          const stockActual = Number(producto.stock);
          if (tipoMovimiento === 'SALIDA' && cantidad > stockActual) {
            throw this._error('Stock insuficiente para registrar la salida', 400);
          }

          const nuevoStock = tipoMovimiento === 'ENTRADA'
            ? stockActual + cantidad
            : stockActual - cantidad;

          const movimiento = await movimientoInventarioRepository.create(
            { tipoMovimiento, cantidad, fecha, productoId, usuarioId },
            transaction
          );
          await productoRepository.update(producto, { stock: nuevoStock }, transaction);

          return movimiento;
        }
      );
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  _error(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  _traducirErrorSequelize(err) {
    if (err.name === 'SequelizeValidationError') {
      return this._error(err.errors?.[0]?.message || 'Datos de movimiento inválidos', 400);
    }
    return err;
  }
}

module.exports = new MovimientoInventarioService();
