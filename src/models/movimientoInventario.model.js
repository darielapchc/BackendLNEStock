const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Producto = require('./producto.model');
const User = require('./user.model');

// Cada entrada o salida conserva quién la registró y cuándo ocurrió.
// El stock actual vive en Producto; este modelo es el historial auditable.
class MovimientoInventario extends Model {}

MovimientoInventario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tipoMovimiento: { type: DataTypes.ENUM('ENTRADA', 'SALIDA'), allowNull: false },
    cantidad: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: { min: { args: [1], msg: 'La cantidad debe ser mayor que cero' } },
    },
    fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    productoId: { type: DataTypes.INTEGER, allowNull: false },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'MovimientoInventario',
    tableName: 'movimientos_inventario',
    timestamps: true,
  }
);

Producto.hasMany(MovimientoInventario, {
  foreignKey: 'productoId',
  as: 'movimientosInventario',
  onDelete: 'RESTRICT',
});
MovimientoInventario.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

User.hasMany(MovimientoInventario, {
  foreignKey: 'usuarioId',
  as: 'movimientosInventario',
  onDelete: 'RESTRICT',
});
MovimientoInventario.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' });

module.exports = MovimientoInventario;
