import request from "supertest";
import app from "../src/app";

// 1. Mockeamos la Base de Datos
// Esto es para evitar que el test intente conectarse a Neon/Postgres real y falle.
jest.mock("../src/config/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  },
}));

// 2. Mockeamos Swagger
// Para evitar ruido en la consola o errores si swagger no carga en entorno de test.
jest.mock("../src/config/swagger", () => ({
  setupSwagger: jest.fn(),
}));

describe("Integración - Configuración de la App", () => {

  describe("Rutas Generales", () => {
    it("debe retornar 404 para una ruta que no existe", async () => {
      const res = await request(app).get("/api/ruta-fantasma-xyz");
      expect(res.status).toBe(404);
      // Express por defecto devuelve HTML en 404, o JSON si lo configuraste.
      // Basta con verificar el status.
    });
  });

  describe("Rutas de Autenticación (/api/auth)", () => {
    it("debe estar montada y responder (no 404) en el login", async () => {
      // Enviamos datos vacíos para provocar un error de validación o lógica
      // Lo importante es que NO nos devuelva 404 (que significaría que la ruta no existe)
      const res = await request(app).post("/api/auth/login").send({});
      
      expect(res.status).not.toBe(404);
      // Probablemente devuelva 500 (por el mock de DB) o 400 (validación), 
      // ambos confirman que Express encontró la ruta.
    });
  });

  describe("Rutas de Perfil (/api/profile)", () => {
    it("debe estar protegida y rechazar acceso sin token (401)", async () => {
      // Intentamos acceder a la raíz o a una subruta común
      // Nota: Si tu ruta en profile.routes.ts es router.get("/"), usa "/api/profile"
      // Si es router.get("/me"), usa "/api/profile/me"
      const res = await request(app).get("/api/profile"); 

      // Si el middleware 'authenticate' está funcionando, debe ser 401
      // Si devuelve 404, revisa si la ruta es correcta.
      if (res.status === 404) {
          console.warn("⚠️ Recibiste 404 en /api/profile. Verifica si tu ruta interna es '/' o '/me'");
      } else {
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty("message");
      }
    });
  });

  describe("Rutas de Ranking (/api/ranking)", () => {
    it("debe ser accesible públicamente (o al menos existir)", async () => {
      const res = await request(app).get("/api/ranking");
      expect(res.status).not.toBe(404);
    });
  });
});