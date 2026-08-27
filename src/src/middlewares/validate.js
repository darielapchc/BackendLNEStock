const { validationResult } = require('express-validator');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// express-validator define las reglas DENTRO de las rutas (ver
// auth.routes.js), pero necesitamos un paso final que revise si esas
// reglas se cumplieron y corte la petición ANTES de llegar al Controller.
// Este middleware es ese "portero": si algo falló, responde 400 y el
// Controller nunca se entera de que la petición existió.
// -----------------------------------------------------------------------
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos de entrada inválidos',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
}

module.exports = handleValidationErrors;
