const favoritoRepository = require('../repositories/favorito.repository');
const productoRepository = require('../repositories/producto.repository');

class FavoritoService {
  async listarPorUsuario(userId) {
    return favoritoRepository.findAllByUserId(userId);
  }

  async crear(userId, productoId) {
    const producto = await productoRepository.findById(productoId);
    if (!producto) throw this._error('Producto no encontrado', 404);

    const existente = await favoritoRepository.findByUserIdAndProductoId(userId, productoId);
    if (existente) throw this._error('El producto ya esta en favoritos', 409);

    try {
      return await favoritoRepository.create({ userId, productoId });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw this._error('El producto ya esta en favoritos', 409);
      }
      throw err;
    }
  }

  async eliminar(userId, productoId) {
    // DELETE is intentionally idempotent: its successful target state is
    // that the product is not in the authenticated user's favorites.
    await favoritoRepository.deleteByUserIdAndProductoId(userId, productoId);
  }

  _error(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }
}

module.exports = new FavoritoService();
