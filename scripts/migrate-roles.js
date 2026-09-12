require('dotenv').config();

const sequelize = require('../src/config/database');

const CONFIRMATION_VALUE = 'YES';
const isConfirmed =
  process.argv.includes('--confirm') ||
  process.env.CONFIRM_ROLE_MIGRATION === CONFIRMATION_VALUE;

async function migrateRoles() {
  if (!isConfirmed) {
    throw new Error(
      'Migración cancelada. Para ejecutarla, usa npm run migrate:roles -- --confirm'
    );
  }

  const [columns] = await sequelize.query(`
    SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'role'
  `);

  if (columns.length === 0) {
    throw new Error('No se encontró la columna users.role en la base de datos configurada');
  }

  const columnType = columns[0].COLUMN_TYPE.toLowerCase();
  if (!columnType.startsWith("enum('") || !columnType.includes("'admin'")) {
    throw new Error(`La columna users.role tiene un ENUM inesperado: ${columns[0].COLUMN_TYPE}`);
  }

  if (columnType.includes("'client'")) {
    // MySQL necesita aceptar ambos valores mientras se convierten las filas existentes.
    await sequelize.query(`
      ALTER TABLE users
      MODIFY COLUMN role ENUM('admin', 'client', 'staff') NOT NULL DEFAULT 'staff'
    `);

    const [, metadata] = await sequelize.query(
      "UPDATE users SET role = 'staff' WHERE role = 'client'"
    );
    console.log(`Usuarios convertidos de client a staff: ${metadata.affectedRows}`);
  }

  await sequelize.query(`
    ALTER TABLE users
    MODIFY COLUMN role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff'
  `);

  console.log('Migración completada: users.role ahora acepta únicamente admin y staff.');
}

migrateRoles()
  .catch((error) => {
    console.error(`No se pudo completar la migración: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
