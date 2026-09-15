require('dotenv').config();

const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

const CONFIRM = process.argv.includes('--confirm');

async function migrateFavoritos() {
  if (!CONFIRM) {
    console.error(
      'Migracion cancelada. Ejecuta npm run migrate:favoritos -- --confirm para crear la tabla favoritos.'
    );
    process.exit(1);
  }

  try {
    await sequelize.authenticate();

    const queryInterface = sequelize.getQueryInterface();
    const tablas = await queryInterface.showAllTables();
    const tablaFavoritosExiste = tablas.some(
      (tabla) => String(tabla).toLowerCase() === 'favoritos'
    );

    if (!tablaFavoritosExiste) {
      await queryInterface.createTable('favoritos', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        productoId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'productos', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      }, {
        indexes: [
          {
            name: 'favoritos_user_producto_unique',
            unique: true,
            fields: ['userId', 'productoId'],
          },
        ],
      });
      console.log('Tabla favoritos creada correctamente.');
    } else {
      console.log('La tabla favoritos ya existe; no se realizaron cambios.');
    }

    await sequelize.close();
  } catch (error) {
    console.error('No se pudo preparar la tabla favoritos:', error.message);
    await sequelize.close();
    process.exitCode = 1;
  }
}

migrateFavoritos();
