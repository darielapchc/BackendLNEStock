const Producto = require('../models/producto.model');
const Categoria = require('../models/categoria.model');
const { Op } = require('sequelize');

// La capa Repository concentra todas las consultas Sequelize de Producto.
class ProductoRepository {
  _incluirCategoria() {
    return {
      model: Categoria,
      as: 'categoria',
      attributes: ['id', 'nombre', 'descripcion', 'icono', 'activo'],
    };
  }

  async findAll() {
    return Producto.findAll({
      include: [this._incluirCategoria()],
      order: [['nombre', 'ASC']],
    });
  }

  async findById(id, options = {}) {
    return Producto.findByPk(id, {
      include: options.includeCategoria ? [this._incluirCategoria()] : undefined,
      transaction: options.transaction,
      lock: options.lock,
    });
  }

  async findByCodigo(codigo) {
    return Producto.findOne({ where: { codigo } });
  }

  async findByCodigoExcluyendoId(codigo, id) {
    return Producto.findOne({ where: { codigo, id: { [Op.ne]: id } } });
  }

  async create(datos) {
    return Producto.create(datos);
  }

  async update(producto, cambios, transaction) {
    return producto.update(cambios, { transaction });
  }

  async delete(producto) {
    return producto.destroy();
  }
}

module.exports = new ProductoRepository();
