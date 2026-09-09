require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

// Importamos los modelos aquí para que Sequelize registre las
// asociaciones (User.hasMany(RefreshToken), etc.) antes del sync/arranque.

/* Mientras defino bien los modelos
require('./models/user.model');
require('./models/refreshToken.model');
require('./models/categoria.model');
*/

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    //Comprobamos la conexión a MySQL
    await sequelize.authenticate();

    console.log('✅ Conexión a MySQL establecida correctamente.');

    // ⚠️ IMPORTANTE PARA EL ESTUDIANTE:
    // `sync({ alter: true })` es cómodo en desarrollo (ajusta las
    // tablas automáticamente a los modelos), pero JAMÁS se usa así en
    // producción -- puede borrar o alterar datos de forma destructiva.
    // En producción se usan migraciones explícitas (sequelize-cli).
    // Lo veremos formalmente en la Semana 3.

    /* Esto lo comento momentaneamente hasta tener claridad de como arreglarlo y defina la rutas de los modelos.
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Modelos sincronizados con la base de datos.');
    }
    */

    //Iniciamos el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor LNE Stock corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
