import { register, login } from "../src/controllers/auth.controller";
import { db } from "../src/config/db";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

// Mock de dependencias
jest.mock("../src/config/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  },
}));

jest.mock("bcryptjs");
jest.mock("../src/utils/jwt", () => ({
  generateToken: jest.fn(() => "fake_token"),
}));

const mockRequest = (body = {}) => ({ body } as Request);
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Casting rápido para evitar errores de TypeScript con Drizzle
const mockDb = db as any;

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("debe registrar un usuario si no existe", async () => {
      const req = mockRequest({ email: "test@test.com", password: "123" });
      const res = mockResponse();

      // Simulamos retorno vacío (no existe usuario)
      mockDb.select().from().where.mockResolvedValueOnce([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_pass");

      await register(req, res);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Usuario registrado correctamente" });
    });

    it("debe fallar si el usuario ya existe", async () => {
      const req = mockRequest({ email: "existente@test.com", password: "123" });
      const res = mockResponse();

      // Simulamos retorno con datos (ya existe)
      mockDb.select().from().where.mockResolvedValueOnce([{ id: 1 }]);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "El usuario ya existe" });
    });
  });

  describe("login", () => {
    it("debe loguear correctamente con credenciales válidas", async () => {
      const req = mockRequest({ email: "test@test.com", password: "123" });
      const res = mockResponse();
      const fakeUser = { id: 1, email: "test@test.com", passwordHash: "hashed", coins: "100" };

      mockDb.select().from().where.mockResolvedValueOnce([fakeUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: "fake_token",
        message: "Inicio de sesión exitoso"
      }));
    });
  });
});