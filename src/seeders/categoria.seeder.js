require('dotenv').config();
const sequelize = require('../config/database');
const Categoria = require('../models/categoria.model');

// -----------------------------------------------------------------------
// CONTEXTO:
// Seed idempotente del catálogo inicial de categorías de LNE Stock.
// Usa findOrCreate para poder ejecutarlo varias veces sin duplicar
// registros existentes.
//
// Uso: node src/seeders/categoria.seeder.js
//
// Este archivo también exporta `seedCategorias()` para que el seeder
// maestro (src/seeders/index.js) lo reutilice sin duplicar la lista.
// -----------------------------------------------------------------------
const CATEGORIAS = [
  {
    nombre: 'Cuadernos',
    descripcion: 'Cuadernos y libretas para uso escolar, universitario y profesional.',
    icono: 'menu_book',
  },
  {
    nombre: 'Lápices',
    descripcion: 'Lápices, colores y otros artículos de escritura.',
    icono: 'edit',
  },
  {
    nombre: 'Papelería',
    descripcion: 'Artículos de papel y materiales para escritura y organización.',
    icono: 'description',
  },
  {
    nombre: 'Arte',
    descripcion: 'Materiales y artículos para dibujo, pintura y actividades artísticas.',
    icono: 'palette',
  },
  {
    nombre: 'Oficina',
    descripcion: 'Artículos y materiales para el trabajo y la organización de oficina.',
    icono: 'business_center',
  },
  {
    nombre: 'Escolar',
    descripcion: 'Materiales y útiles para actividades escolares.',
    icono: 'school',
  },
];

// Lógica de siembra reutilizable.
async function seedCategorias() {
  for (const categoria of CATEGORIAS) {
    const [registro, creado] = await Categoria.findOrCreate({
      where: { nombre: categoria.nombre },
      defaults: categoria,
    });
    console.log(creado ? `✅ Creada: ${registro.nombre}` : `↪️  Ya existía: ${registro.nombre}`);
  }
}

// Wrapper para ejecutar este archivo individualmente.
async function seed() {
  try {
    await sequelize.authenticate();
    await seedCategorias();
    console.log('🌱 Seed de categorías completado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el seed de categorías:', error);
    process.exit(1);
  }
}

// // Solo se ejecuta automáticamente si este archivo se invoca directamente.
if (require.main === module) {
  seed();
}

module.exports = { CATEGORIAS, seedCategorias };
