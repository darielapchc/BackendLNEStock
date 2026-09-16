const usuarioService = require('../services/usuario.service');

class UsuarioController {
  async listarUsuarios(req, res, next) {
    try {
      const usuarios = await usuarioService.listUsers();
      res.status(200).json(usuarios);
    } catch (err) {
      next(err);
    }
  }

  async obtenerUsuario(req, res, next) {
    try {
      const usuario = await usuarioService.getUserById(req.params.id);
      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  }

  async actualizarEstado(req, res, next) {
    try {
      const usuario = await usuarioService.updateUserStatus(
        req.params.id,
        req.body.isActive,
        req.user.id
      );
      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  }

  async restablecerPassword(req, res, next) {
    try {
      await usuarioService.resetUserPassword(req.params.id, req.body.password);
      res.status(200).json({ message: 'La contraseña fue actualizada correctamente' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UsuarioController();
