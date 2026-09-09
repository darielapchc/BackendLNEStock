const categoriaRepository = require('../repositories/categoria.repository');
const productoRepository = require('../repositories/producto.repository');
const movimientoInventarioRepository = require('../repositories/movimientoInventario.repository');

class ProductoService {
  async listar() {
    return productoRepository.findAll();
  }

  async obtenerPorId(id) {
    const producto = await productoRepository.findById(id, { includeCategoria: true });
    if (!producto) throw this._error('Producto no encontrado', 404);
    return producto;
  }

  async crear(datos) {
    await this._validarCategoria(datos.categoriaId);

    const existente = await productoRepository.findByCodigo(datos.codigo);
    if (existente) throw this._error('Ya existe un producto con ese código', 409);

    try {
      const producto = await productoRepository.create(datos);
      return this.obtenerPorId(producto.id);
    } catch (err) {
      throw this._traducirErrorSequelize(err, 'Datos de producto inválidos');
    }
  }

  async actualizar(id, datos) {
    const producto = await this.obtenerPorId(id);
    const cambios = Object.fromEntries(
      Object.entries(datos).filter(([, valor]) => valor !== undefined)
    );

    if (cambios.categoriaId !== undefined) {
      await this._validarCategoria(cambios.categoriaId);
    }

    if (cambios.codigo !== undefined) {
      const duplicado = await productoRepository.findByCodigoExcluyendoId(cambios.codigo, id);
      if (duplicado) throw this._error('Ya existe otro producto con ese código', 409);
    }

    try {
      await productoRepository.update(producto, cambios);
      return this.obtenerPorId(id);
    } catch (err) {
      throw this._traducirErrorSequelize(err, 'Datos de producto inválidos');
    }
  }

  async eliminar(id) {
    const producto = await this.obtenerPorId(id);
    const movimientos = await movimientoInventarioRepository.countByProductoId(producto.id);

    if (movimientos > 0) {
      throw this._error(
        'No se puede eliminar un producto que tiene movimientos de inventario',
        409
      );
    }

    try {
      await productoRepository.delete(producto);
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        throw this._error(
          'No se puede eliminar un producto que tiene movimientos de inventario',
          409
        );
      }
      throw err;
    }
  }

  async _validarCategoria(categoriaId) {
    const categoria = await categoriaRepository.findById(categoriaId);
    if (!categoria || !categoria.activo) {
      throw this._error('La categoría indicada no existe o está inactiva', 400);
    }
  }

  _error(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  _traducirErrorSequelize(err, mensajePorDefecto) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return this._error(err.errors?.[0]?.message || mensajePorDefecto, 400);
    }
    return err;
  }
}

module.exports = new ProductoService();
