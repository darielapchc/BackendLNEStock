const favoritoService = require('../services/favorito.service');

class FavoritoController {
  async listarFavoritos(req, res, next) {
    try {
      const favoritos = await favoritoService.listarPorUsuario(req.user.id);
      res.status(200).json(favoritos);
    } catch (err) {
      next(err);
    }
  }

  async crearFavorito(req, res, next) {
    try {
      const favorito = await favoritoService.crear(req.user.id, Number(req.params.productoId));
      res.status(201).json(favorito);
    } catch (err) {
      next(err);
    }
  }

  async eliminarFavorito(req, res, next) {
    try {
      await favoritoService.eliminar(req.user.id, Number(req.params.productoId));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FavoritoController();
