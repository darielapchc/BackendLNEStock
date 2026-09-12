const categoriaRepository = require('../repositories/categoria.repository');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Lógica de negocio de las categorías de productos de LNE Stock,
// la aplicación de inventario de la papelería. Este servicio valida
// reglas como nombres únicos y coordina la desactivación de categorías
// sin borrar el historial de los productos que las utilizan.
// No conoce req/res, igual que auth.service.js: los errores de dominio
// se lanzan con `error.statusCode` y el Controller/errorHandler decide
// cómo traducirlos a HTTP.
// -----------------------------------------------------------------------
class CategoriaService {
  async listar({ activo } = {}) {
    return categoriaRepository.findAll({ activo });
  }

  async obtenerPorId(id) {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) {
      const error = new Error('Categoría no encontrada');
      error.statusCode = 404;
      throw error;
    }
    return categoria;
  }

  async crear({ nombre, descripcion, icono }) {
    const existente = await categoriaRepository.findByNombre(nombre);
    if (existente) {
      const error = new Error('Ya existe una categoría con ese nombre');
      error.statusCode = 409;
      throw error;
    }

    try {
      return await categoriaRepository.create({ nombre, descripcion, icono });
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  async actualizar(id, { nombre, descripcion, icono, activo }) {
    const categoria = await this.obtenerPorId(id);

    if (nombre !== undefined) {
      const duplicada = await categoriaRepository.findByNombreExcluyendoId(nombre, id);
      if (duplicada) {
        const error = new Error('Ya existe otra categoría con ese nombre');
        error.statusCode = 409;
        throw error;
      }
    }

    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre;
    if (descripcion !== undefined) cambios.descripcion = descripcion;
    if (icono !== undefined) cambios.icono = icono;
    if (activo !== undefined) cambios.activo = activo;

    try {
      return await categoriaRepository.update(categoria, cambios);
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  async eliminar(id) {
    const categoria = await this.obtenerPorId(id);
    return categoriaRepository.softDelete(categoria);
  }

  // Traduce errores de validación/unicidad de Sequelize a errores de
  // dominio con statusCode 400, usando el mismo formato que el resto
  // de LNE Stock (ver errorHandler.js).
  
  _traducirErrorSequelize(err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const mensaje = err.errors?.[0]?.message || 'Datos de categoría inválidos';
      const error = new Error(mensaje);
      error.statusCode = 400;
      return error;
    }
    return err;
  }
}

module.exports = new CategoriaService();
