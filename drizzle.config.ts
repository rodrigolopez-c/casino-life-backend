import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // 👈 ESTE CAMPO ES OBLIGATORIO
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://casino_admin:casino123@localhost:5432/casino_life",
  },
} satisfies Config;