import { getRanking } from "../src/controllers/ranking.controller";
import { db } from "../src/config/db";
import { Request, Response } from "express";

jest.mock("../src/config/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Usamos any para poder acceder a .limit en los expects
const mockDb = db as any;

describe("Ranking Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar una lista limitada de usuarios", async () => {
    const req = { query: { limit: "5" } } as unknown as Request;
    const res = mockResponse();
    const fakeRanking = [{ id: 1, coins: "999" }];
    
    // La cadena termina en .limit()
    mockDb.select().from().orderBy().limit.mockResolvedValue(fakeRanking);

    await getRanking(req, res);

    expect(mockDb.limit).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith({ count: 1, results: fakeRanking });
  });

  it("debe aplicar un límite máximo de 100", async () => {
    const req = { query: { limit: "500" } } as unknown as Request;
    const res = mockResponse();

    mockDb.select().from().orderBy().limit.mockResolvedValue([]);

    await getRanking(req, res);

    expect(mockDb.limit).toHaveBeenCalledWith(100);
  });
});