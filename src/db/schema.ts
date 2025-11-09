import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  coins: integer("coins").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameRecords = pgTable("game_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  game: text("game").notNull(),
  result: text("result").notNull(),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});