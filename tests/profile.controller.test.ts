import { getMyProfile, updateCoins } from "../src/controllers/profile.controller";
import { db } from "../src/config/db";
import { Response } from "express";

// Mock de la base de datos
jest.mock("../src/config/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(), // Importante que esté aquí
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
  },
}));

const mockAuthRequest = (user: any, body = {}) => ({ user, body } as any);
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Usamos 'any' para manejar el encadenamiento flexiblemente
const mockDb = db as any;

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMyProfile", () => {
    it("debe retornar perfil e historial", async () => {
      const req = mockAuthRequest({ id: 1 });
      const res = mockResponse();

      const userResult = [{ id: 1, email: "x", coins: "500.00" }];
      const historyResult = [{ id: 10, amount: "10.00" }];

      // --- CONFIGURACIÓN DEL MOCK (LA PARTE CLAVE) ---
      
      // 1. Primera consulta (Usuario): Termina en .where()
      // Sobrescribimos el comportamiento para que la primera vez devuelva datos
      mockDb.where.mockResolvedValueOnce(userResult);

      // 2. Segunda consulta (Historial): Pasa por .where() y termina en .orderBy()
      // La segunda vez que se llame a .where(), debe retornar 'this' (el mockDb) para permitir encadenar .orderBy
      mockDb.where.mockReturnValueOnce(mockDb);
      
      // Y configuramos .orderBy para que devuelva el historial
      mockDb.orderBy.mockResolvedValueOnce(historyResult);

      await getMyProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: expect.objectContaining({ coins: "500.00" }),
        history: expect.any(Array)
      });
    });
  });

  describe("updateCoins", () => {
    it("debe sumar monedas si gana", async () => {
      const req = mockAuthRequest({ id: 1 }, { game: "blackjack", result: "win", amount: 50 });
      const res = mockResponse();

      // Aquí solo hay una consulta de lectura que termina en .where()
      mockDb.where.mockResolvedValueOnce([{ coins: "100.00" }]);

      await updateCoins(req, res);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ coins: "150.00" });
      expect(mockDb.insert).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ newBalance: 150 }));
    });
  });
});