import { Response } from "express";
import { db } from "../config/db";
import { users, gameRecords } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { AuthRequest } from "../middlewares/auth";

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "No autorizado" });

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        coins: users.coins,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const history = await db
      .select({
        id: gameRecords.id,
        game: gameRecords.game,
        result: gameRecords.result,
        amount: gameRecords.amount,
        createdAt: gameRecords.createdAt,
      })
      .from(gameRecords)
      .where(eq(gameRecords.userId, user.id))
      .orderBy(desc(gameRecords.createdAt));

    res.json({
      user,
      history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo obtener el perfil" });
  }
};