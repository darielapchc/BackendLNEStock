const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Categoria = require('./categoria.model');

// -----------------------------------------------------------------------
// CONTEXTO:
// Un producto pertenece a una categoría y representa una existencia real
// del inventario. El stock se actualiza exclusivamente desde el servicio
// de movimientos para que cada cambio quede registrado en el historial.
// -----------------------------------------------------------------------
class Producto extends Model {}

Producto.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre del producto es obligatorio' } },
    },
    descripcion: { type: DataTypes.STRING(500), allowNull: true },
    codigo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'El código del producto es obligatorio' } },
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: { args: [0], msg: 'El precio no puede ser negativo' } },
    },
    stock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: { min: { args: [0], msg: 'El stock no puede ser negativo' } },
    },
    imagen: { type: DataTypes.STRING(500), allowNull: true },
    categoriaId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Producto', tableName: 'productos', timestamps: true }
);

Categoria.hasMany(Producto, {
  foreignKey: 'categoriaId',
  as: 'productos',
  onDelete: 'RESTRICT',
});
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

module.exports = Producto;
