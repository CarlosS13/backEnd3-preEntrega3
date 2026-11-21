import mongoose from "mongoose";
import config from "./index.js";

export async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`[DB] Conectado a MongoDB (${config.env})`);
  } catch (error) {
    console.error("[DB Error] No se pudo conectar a MongoDB:", error.message);
    throw error;
  }
}