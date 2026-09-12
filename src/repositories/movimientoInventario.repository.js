const sequelize = require('../config/database');
const MovimientoInventario = require('../models/movimientoInventario.model');
const Producto = require('../models/producto.model');
const User = require('../models/user.model');

// Esta capa también es responsable de iniciar la transacción. Así el
// servicio coordina reglas de negocio sin importar Sequelize directamente.
class MovimientoInventarioRepository {
  async findAll() {
    return MovimientoInventario.findAll({
      include: [
        { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'codigo'] },
        { model: User, as: 'usuario', attributes: ['id', 'fullName', 'email'] },
      ],
      order: [['fecha', 'DESC'], ['id', 'DESC']],
    });
  }

  async create(datos, transaction) {
    return MovimientoInventario.create(datos, { transaction });
  }

  async countByProductoId(productoId) {
    return MovimientoInventario.count({ where: { productoId } });
  }

  async ejecutarEnTransaccion(callback) {
    return sequelize.transaction(callback);
  }
}

module.exports = new MovimientoInventarioRepository();
