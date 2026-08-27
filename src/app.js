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
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // necesario para que las cookies httpOnly viajen
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

// 404 para cualquier ruta no definida
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// SIEMPRE al final: captura errores de todos los controllers.
app.use(errorHandler);

module.exports = app;
