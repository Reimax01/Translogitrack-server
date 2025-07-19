// tests/controllers/pedidoController.test.js
const { crearPedido } = require('../../controllers/pedidoController');
const { validationResult } = require('express-validator');

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

const Pedido = require('../../models/Pedido');
const Camion = require('../../models/Camion');
const Conductor = require('../../models/Conductor');
const Ruta = require('../../models/Ruta');
const SeguimientoPedido = require('../../models/SeguimientoPedido');

jest.mock('../../models/Pedido');
jest.mock('../../models/Camion');
jest.mock('../../models/Conductor');
jest.mock('../../models/Ruta');
jest.mock('../../models/SeguimientoPedido');

describe('crearPedido', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        id_ruta: 1,
        id_camion: 1,
        id_conductor: 1,
        id_usuario: 10, // cliente
        descripcion: 'Carga frágil',
      },
      usuario: {
        id: 10,
        rol: 'Cliente'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();

    validationResult.mockReturnValue({
      isEmpty: () => true
    });
  });

  it('debería crear un pedido exitosamente', async () => {
    Camion.findByPk.mockResolvedValue({ 
      id_camion: 1, estado_operativo: 'Disponible', update: jest.fn() 
    });

    Conductor.findByPk.mockResolvedValue({ 
      id_conductor: 1, activo: true 
    });

    Ruta.findByPk.mockResolvedValue({ id_ruta: 1 });

    Pedido.create.mockResolvedValue({ id_pedido: 100 });

    SeguimientoPedido.create.mockResolvedValue({});

    await crearPedido(req, res, next);

    expect(Camion.findByPk).toHaveBeenCalledWith(1);
    expect(Conductor.findByPk).toHaveBeenCalledWith(1);
    expect(Ruta.findByPk).toHaveBeenCalledWith(1);
    expect(Pedido.create).toHaveBeenCalledWith(expect.objectContaining({
      id_cliente: 10,
      id_ruta: 1,
      id_camion: 1,
      id_conductor: 1,
      estado: 'Pendiente'
    }));
    expect(SeguimientoPedido.create).toHaveBeenCalledWith({
      id_pedido: 100,
      estado: 'Pendiente'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });
});
