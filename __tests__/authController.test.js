const { login } = require('../controllers/authController');
const httpMocks = require('node-mocks-http');
const Usuario = require('../models/Usuario');
const jwtUtils = require('../utils/jwt');

jest.mock('../models/Usuario');
jest.mock('../utils/jwt');

describe('authController.login', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'POST',
      body: {
        correo_electronico: 'test@correo.com',
        contrasena: '123456'
      }
    });

    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it('debe responder con token y usuario válido cuando el login es exitoso', async () => {
    const usuarioMock = {
      id_usuario: 1,
      nombre_completo: 'Juan Pérez',
      rol: 'Admin',
      correo_electronico: 'test@correo.com',
      activo: true,
      validarContrasena: jest.fn().mockResolvedValue(true)
    };

    Usuario.findOne.mockResolvedValue(usuarioMock);

    jwtUtils.generarToken.mockReturnValue('fake-token');

    await login(req, res, next);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.token).toBe('fake-token');
    expect(data.usuario).toEqual({
      id: 1,
      nombre: 'Juan Pérez',
      rol: 'Admin',
      correo: 'test@correo.com'
    });
  });

  it('debe responder 401 si la contraseña es incorrecta', async () => {
    const usuarioMock = {
      validarContrasena: jest.fn().mockResolvedValue(false)
    };

    Usuario.findOne.mockResolvedValue(usuarioMock);

    await login(req, res, next);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(401);
    expect(data.mensaje).toBe('Credenciales inválidas');
  });

  it('debe responder 403 si el usuario está inactivo', async () => {
    const usuarioMock = {
      validarContrasena: jest.fn().mockResolvedValue(true),
      activo: false
    };

    Usuario.findOne.mockResolvedValue(usuarioMock);

    await login(req, res, next);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(403);
    expect(data.mensaje).toBe('Cuenta desactivada');
  });

  it('debe responder 401 si el usuario no existe', async () => {
    Usuario.findOne.mockResolvedValue(null);

    await login(req, res, next);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(401);
    expect(data.mensaje).toBe('Credenciales inválidas');
  });

  it('debe manejar errores y llamar a next con el error', async () => {
    const error = new Error('DB error');
    Usuario.findOne.mockRejectedValue(error);

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
