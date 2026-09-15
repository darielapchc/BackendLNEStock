const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Producto = require('./producto.model');

class Favorito extends Model {}

Favorito.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productoId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Favorito',
    tableName: 'favoritos',
    timestamps: true,
    indexes: [
      {
        name: 'favoritos_user_producto_unique',
        unique: true,
        fields: ['userId', 'productoId'],
      },
    ],
  }
);

User.hasMany(Favorito, {
  foreignKey: 'userId',
  as: 'favoritos',
  onDelete: 'CASCADE',
});
Favorito.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });

Producto.hasMany(Favorito, {
  foreignKey: 'productoId',
  as: 'favoritos',
  onDelete: 'CASCADE',
});
Favorito.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

module.exports = Favorito;
