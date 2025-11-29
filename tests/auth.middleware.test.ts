import { authenticate, AuthRequest } from "../src/middlewares/auth";
import { verifyToken } from "../src/utils/jwt";
import { Response, NextFunction } from "express";

// 1. Mockeamos el utilitario JWT para controlar si el token es válido o no
jest.mock("../src/utils/jwt", () => ({
  verifyToken: jest.fn(),
}));

// Helper para crear el Response falso
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("Auth Middleware", () => {
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
    next = jest.fn(); // Mock de la función next()
  });

  it("debe retornar 401 si no se envía el header de autorización", () => {
    // req vacío de headers
    const req = { headers: {} } as AuthRequest;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token no proporcionado" });
    expect(next).not.toHaveBeenCalled(); // Aseguramos que NO deje pasar
  });

  it("debe retornar 401 si el formato no es 'Bearer <token>'", () => {
    // Header existe pero está mal formado
    const req = { 
      headers: { authorization: "Basic token123" } 
    } as AuthRequest;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token no proporcionado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("debe retornar 401 si verifyToken devuelve null (token inválido)", () => {
    const req = { 
      headers: { authorization: "Bearer token_malo" } 
    } as AuthRequest;

    // Simulamos que el token es inválido
    (verifyToken as jest.Mock).mockReturnValue(null);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token inválido o expirado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("debe llamar a next() y adjuntar el usuario si el token es válido", () => {
    const req = { 
      headers: { authorization: "Bearer token_bueno" } 
    } as AuthRequest;

    const mockUser = { id: 1, email: "test@test.com" };

    // Simulamos éxito
    (verifyToken as jest.Mock).mockReturnValue(mockUser);

    authenticate(req, res, next);

    // Verificaciones de éxito
    expect(verifyToken).toHaveBeenCalledWith("token_bueno"); // Verifica que extrajo bien el token
    expect(req.user).toEqual(mockUser); // Verifica que creó el contexto
    expect(next).toHaveBeenCalled(); // Verifica que dejó pasar la petición
    expect(res.status).not.toHaveBeenCalled(); // No debe haber errores
  });
});