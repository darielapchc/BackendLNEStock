// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Recuerdas los "next(err)" en el Controller? Todos terminan aquí.
// Centralizar el manejo de errores evita repetir try/catch con la misma
// lógica de "traducir error a status code" en cada controller de la app.
// Debe ser el ÚLTIMO middleware registrado en app.js.
// -----------------------------------------------------------------------
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    // Los errores 500 sí se loguean completos -- son bugs nuestros,
    // no errores esperados del negocio (como "correo ya registrado").
    console.error('[ERROR NO CONTROLADO]', err);
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? 'Error interno del servidor' : err.message,
  });
}

module.exports = errorHandler;
