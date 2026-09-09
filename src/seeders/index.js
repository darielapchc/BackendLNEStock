require('dotenv').config();

const sequelize = require('../config/database');
const User = require('../models/user.model');
const Categoria = require('../models/categoria.model');

// RefreshToken no se siembra, pero su modelo debe registrarse para que
// Sequelize conozca la asociación User.hasMany(RefreshToken) al hacer sync() -- si no, la tabla refresh_tokens nunca se crea.
require('../models/refreshToken.model');

const RefreshToken = require('../models/refreshToken.model');
const { hashPassword } = require('../utils/password');
const { seedCategorias } = require('./categoria.seeder');

// -----------------------------------------------------------------------
// CONTEXTO:
// Este es el SEEDER MAESTRO: orquesta todo lo necesario para poder
// probar el login, los endpoints y el home de la app Flutter de punta a
// punta con un solo comando. Respeta el mismo mecanismo de hasheo que
// usa el registro real (AuthService -> hashPassword con bcrypt, ver
// src/utils/password.js) -- NO es un hook del modelo, así que acá
// también hay que hashear "a mano" antes de guardar, igual que hace
// AuthService.register().
//
// Es idempotente por defecto (findOrCreate: correrlo 10 veces no
// duplica nada). Con --reset borra las tablas relacionadas primero
// (ver función reset()) para partir de una base limpia -- SOLO usar en
// desarrollo, nunca en producción.
//
// Uso:
//   node src/seeders/index.js            (o: npm run seed)
//   node src/seeders/index.js --reset    (o: npm run seed:reset)
// -----------------------------------------------------------------------

const RESET = process.argv.includes('--reset');

// Contraseña para los usuarios de prueba.
// Solo debe utilizarse para desarrollo.
const PASSWORD_PRUEBA = 'LNEStock123';

const USUARIOS_BASE = [
  { 
    fullName: 'Administración LNE Stock', email: 'admin@lnestock.hn', role: 'admin' 
  },

  { 
    fullName: 'Lia Jael', email: 'liajael@gmail.com', role: 'client' 
  },

  {
    fullName: 'Isis Pacheco', email: 'isispacheco@gmail.com', role: 'client' 
  },

];

const TODOS_LOS_EMAILS = [
  ...USUARIOS_BASE.map((u) => u.email),
];

// -----------------------------------------------------------------------
// --reset
// -----------------------------------------------------------------------
// Vacía las tablas utilizadas por este seeder.
//
// ⚠️ SOLO UTILIZAR EN DESARROLLO.
// -----------------------------------------------------------------------

async function reset() {
  console.log(
    '⚠️  --reset: vaciando tablas (refresh_tokens, usuarios, categorías)...'
  );

  await RefreshToken.destroy({
    where: {} //truncate: true, cascade: true 
  });
  
  await User.destroy({
   where: {} //truncate: true, cascade: true
  });

  await Categoria.destroy({
    where: {} //truncate: true, cascade: true
  });

  console.log('🧹 Tablas vaciadas.\n');
}

//-------------------------------------------------------
// La parte de USUARIOS
//-------------------------------------------------------


async function seedUsuariosBase(passwordHash) {
  const creados = [];
  for (const datos of USUARIOS_BASE) {
    const [user, fueCreado] = await User.findOrCreate({
      where: { email: datos.email },
      defaults: { ...datos, passwordHash },
    });
    console.log(
      fueCreado ? `✅ Usuario creado (${user.role}): ${user.email}` : `↪️  Ya existía (${user.role}): ${user.email}`
    );
    creados.push(user);
  }
  return creados;
}

// -----------------------------------------------------------------------
// RESUMEN
// -----------------------------------------------------------------------

function imprimirResumen(usuariosBase) {
  console.log('\n===================================================================');
  console.log('🌱 SEED MAESTRO COMPLETADO -- credenciales de prueba LNE STOCK (solo desarrollo)');
  console.log('===================================================================');
  console.log(`Contraseña para TODOS los usuarios: ${PASSWORD_PRUEBA}\n`);

  console.log('Usuarios disponibles:\n');

  for (const usuario of usuariosBase) {
    console.log(`- Rol: ${usuario.role} | Email: ${usuario.email}`);
  }

  console.log('===================================================================\n');
}

// -----------------------------------------------------------------------
// EJECUCIÓN PRINCIPAL
// -----------------------------------------------------------------------

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida.');

    //Crea las tablas necesarioas. 
    await sequelize.sync();

    if (RESET) {
      await reset();
    }

    console.log('\n--- 1) Categorías ---');
    await seedCategorias();

    const passwordHash = await hashPassword(PASSWORD_PRUEBA);

    console.log('\n--- 2) Usuarios base ---');
    const usuariosBase = await seedUsuariosBase(passwordHash);

    imprimirResumen(usuariosBase);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al ejecutar el seed maestro:', error);
    process.exit(1);
  }
}

seed();

module.exports = { USUARIOS_BASE, PASSWORD_PRUEBA};
