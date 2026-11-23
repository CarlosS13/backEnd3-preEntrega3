import express from "express";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import mockRoutes from "./routes/mock.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./errors/AppError.js";
import { ERROR_CODES } from "./errors/errorDictionary.js";
import { HTTP_STATUS } from "./utils/constants.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: "ok", service: "shipnow-api" });
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mocks", mockRoutes);

app.use((req, res, next) => {
  next(
    new NotFoundError(
      ERROR_CODES.VALIDATION_ERROR,
      `No se encontró la ruta ${req.method} ${req.originalUrl}`
    )
  );
});

app.use(errorHandler);

export default app;