const categoriaService = require('../services/categoria.service');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Controller delgado (mismo estilo que auth.controller.js): lee el
// request, llama al Service correcto, decide status code + forma de
// la respuesta. Cero lógica de negocio aquí.
// -----------------------------------------------------------------------
class CategoriaController {
  async listarCategorias(req, res, next) {
    try {
      const { activo } = req.query;
      const filtro = {};
      // La app móvil pide ?activo=true para traer solo el catálogo vigente.
      if (activo !== undefined) filtro.activo = activo === 'true';

      const categorias = await categoriaService.listar(filtro);
      res.status(200).json(categorias);
    } catch (err) {
      next(err);
    }
  }

  async obtenerCategoria(req, res, next) {
    try {
      const categoria = await categoriaService.obtenerPorId(req.params.id);
      res.status(200).json(categoria);
    } catch (err) {
      next(err);
    }
  }

  async crearCategoria(req, res, next) {
    try {
      const { nombre, descripcion, icono } = req.body;
      const categoria = await categoriaService.crear({ nombre, descripcion, icono });
      res.status(201).json(categoria);
    } catch (err) {
      next(err);
    }
  }

  async actualizarCategoria(req, res, next) {
    try {
      const { nombre, descripcion, icono, activo } = req.body;
      const categoria = await categoriaService.actualizar(req.params.id, {
        nombre,
        descripcion,
        icono,
        activo,
      });
      res.status(200).json(categoria);
    } catch (err) {
      next(err);
    }
  }

  async eliminarCategoria(req, res, next) {
    try {
      await categoriaService.eliminar(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoriaController();
