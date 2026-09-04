const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Catálogo de categorías de servicios (plomería, electricidad, etc.).
// Los servicios que publiquen los proveedores van a referenciar una
// categoría por su id -- por eso "eliminar" nunca es un borrado físico,
// solo se desactiva (ver categoria.repository.js).
// -----------------------------------------------------------------------
class Categoria extends Model {}

Categoria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'El nombre de la categoría es obligatorio' } },
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Nombre del ícono de Material Icons, para que la app Flutter lo
    // renderice sin tener que mapear categoría -> ícono a mano.
    icono: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Categoria',
    tableName: 'categorias',
    timestamps: true,
  }
);

module.exports = Categoria;
