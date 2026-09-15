require('dotenv').config();

const sequelize = require('../src/config/database');
const Favorito = require('../src/models/favorito.model');

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
    // sync() sobre este unico modelo emite CREATE TABLE IF NOT EXISTS. No usa
    // alter ni force, por lo que no modifica ni elimina tablas existentes.
    await Favorito.sync();
    console.log('Tabla favoritos verificada/creada correctamente.');
    await sequelize.close();
  } catch (error) {
    console.error('No se pudo preparar la tabla favoritos:', error.message);
    await sequelize.close();
    process.exitCode = 1;
  }
}

migrateFavoritos();
