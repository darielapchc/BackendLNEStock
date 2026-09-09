const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// -----------------------------------------------------------------------
// CONTEXTO:
// Catálogo de categorías de productos de la papelería LNE Stock
// (cuadernos, útiles escolares, artículos de oficina, etc.).
// Los productos registrados en el inventario pueden referenciar una
// categoría por su id. Por eso, "eliminar" una categoría no implica
// borrarla físicamente: se desactiva para conservar el historial y
// evitar problemas con los productos que ya la utilizan.
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
