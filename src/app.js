const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Separamos "app.js" (QUÉ hace el servidor) de "server.js" (CÓMO y
// CUÁNDO arranca). Esto parece un detalle menor, pero es enorme para
// testing: en los tests de integración (Semana 20-21, Supertest)
// importaremos "app" directamente SIN levantar un puerto real.
// -----------------------------------------------------------------------

const app = express();

// CORS: solo permitimos que nuestro frontend (Nuxt) y la app Flutter
// consuman la API. En desarrollo, el origin viene del .env.
/*
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // necesario para que las cookies httpOnly viajen
  })
);
*/

// Configuración de CORS.
// Durante el desarrollo permitimos que Flutter y otras herramientas
// de prueba consuman la API.
app.use(cors());

// Middleware para interpretar datos JSON enviados a la API.
app.use(express.json());

// Middleware para trabajar con cookies.
// Se conserva mientras revisamos la implementación de autenticación.
app.use(cookieParser());

//Ruta para comprobar funcionalidad del servidor.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//Rutas principales de la Api
app.use('/api', routes);

// 404 para cualquier ruta no definida o inexistente.
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// SIEMPRE al final: captura errores de todos los controllers.
app.use(errorHandler);

module.exports = app;