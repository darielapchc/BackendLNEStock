const { Op } = require('sequelize');
const Categoria = require('../models/categoria.model');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Única capa que sabe hablar con Sequelize para Categoria (mismo patrón
// que user.repository.js / refreshToken.repository.js).
// -----------------------------------------------------------------------
class CategoriaRepository {
  async findAll({ activo } = {}) {
    const where = {};
    if (activo !== undefined) where.activo = activo;

    return Categoria.findAll({ where, order: [['nombre', 'ASC']] });
  }

  async findById(id) {
    return Categoria.findByPk(id);
  }

  async findByNombre(nombre) {
    return Categoria.findOne({ where: { nombre } });
  }

  // Para validar duplicados al actualizar, sin chocar contra sí misma.
  async findByNombreExcluyendoId(nombre, id) {
    return Categoria.findOne({ where: { nombre, id: { [Op.ne]: id } } });
  }

  async create({ nombre, descripcion, icono }) {
    return Categoria.create({ nombre, descripcion, icono });
  }

  async update(categoria, cambios) {
    return categoria.update(cambios);
  }

  // Soft delete: nunca se borra el registro, porque los servicios de
  // proveedores/solicitudes pueden referenciar la categoría por id.
  async softDelete(categoria) {
    return categoria.update({ activo: false });
  }

  // Alternativa de borrado físico -- NO usar mientras existan tablas
  // que referencien categoriaId (rompería la integridad referencial o
  // borraría en cascada servicios que aún son válidos):
  // async hardDelete(categoria) {
  //   return categoria.destroy();
  // }
}

module.exports = new CategoriaRepository();
