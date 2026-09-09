const productoService = require('../services/producto.service');

// Controller delgado: el service conserva las reglas de categorías,
// códigos únicos y eliminación segura de productos.
class ProductoController {
  async listarProductos(req, res, next) {
    try {
      const productos = await productoService.listar();
      res.status(200).json(productos);
    } catch (err) {
      next(err);
    }
  }

  async obtenerProducto(req, res, next) {
    try {
      const producto = await productoService.obtenerPorId(req.params.id);
      res.status(200).json(producto);
    } catch (err) {
      next(err);
    }
  }

  async crearProducto(req, res, next) {
    try {
      const { nombre, descripcion, codigo, precio, stock, imagen, categoriaId } = req.body;
      const producto = await productoService.crear({
        nombre, descripcion, codigo, precio, stock, imagen, categoriaId,
      });
      res.status(201).json(producto);
    } catch (err) {
      next(err);
    }
  }

  async actualizarProducto(req, res, next) {
    try {
      const { nombre, descripcion, codigo, precio, imagen, categoriaId } = req.body;
      const producto = await productoService.actualizar(req.params.id, {
        nombre, descripcion, codigo, precio, imagen, categoriaId,
      });
      res.status(200).json(producto);
    } catch (err) {
      next(err);
    }
  }

  async eliminarProducto(req, res, next) {
    try {
      await productoService.eliminar(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductoController();
