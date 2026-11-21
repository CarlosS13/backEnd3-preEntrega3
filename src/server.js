import config from "./config/index.js";
import { connectDatabase } from "./config/database.js";
import app from "./app.js";

async function bootstrap() {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`[Server] ShipNow API escuchando en http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("[Fatal] Falló el arranque de ShipNow API:", error.message);
  process.exit(1);
});