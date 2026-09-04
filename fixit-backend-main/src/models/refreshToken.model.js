const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Un JWT normal, una vez emitido, no se puede "apagar" — vive hasta que
// expira. Si guardamos el refreshToken en una tabla, ganamos la capacidad
// de revocarlo (ej: "cerrar sesión en todos los dispositivos", o si
// detectamos actividad sospechosa). El accessToken sigue siendo
// stateless (no se guarda en BD), pero el refreshToken SÍ tiene estado.
// -----------------------------------------------------------------------
class RefreshToken extends Model {}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true, // null = todavía válido
    },
    // Guardamos de qué dispositivo/navegador vino, útil para que el
    // usuario vea "sesiones activas" (como hace Google, GitHub, etc.)
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
  }
);

RefreshToken.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(RefreshToken, { foreignKey: 'userId' });

module.exports = RefreshToken;
