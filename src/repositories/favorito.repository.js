const Favorito = require('../models/favorito.model');
const Producto = require('../models/producto.model');
const Categoria = require('../models/categoria.model');

class FavoritoRepository {
  _includeProducto() {
    return {
      model: Producto,
      as: 'producto',
      attributes: [
        'id', 'nombre', 'descripcion', 'codigo', 'precio',
        'stock', 'imagen', 'categoriaId',
      ],
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'descripcion', 'icono', 'activo'],
        },
      ],
    };
  }

  async findAllByUserId(userId) {
    return Favorito.findAll({
      where: { userId },
      include: [this._includeProducto()],
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
    });
  }

  async findByUserIdAndProductoId(userId, productoId) {
    return Favorito.findOne({ where: { userId, productoId } });
  }

  async create({ userId, productoId }) {
    return Favorito.create({ userId, productoId });
  }

  async deleteByUserIdAndProductoId(userId, productoId) {
    return Favorito.destroy({ where: { userId, productoId } });
  }
}

module.exports = new FavoritoRepository();
