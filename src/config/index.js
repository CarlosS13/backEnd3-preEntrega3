import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGODB_URI"];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]?.trim());

if (missingVars.length > 0) {
  throw new Error(
    `[Config Error] Faltan variables de entorno obligatorias: ${missingVars.join(", ")}. Revisá tu archivo .env o .env.example.`
  );
}

const port = Number(process.env.PORT) || 3000;
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`[Config Error] PORT inválido: "${process.env.PORT}"`);
}

const config = Object.freeze({
  env: process.env.NODE_ENV || "development",
  port,
  mongoUri: process.env.MONGODB_URI.trim(),
});

export default config;