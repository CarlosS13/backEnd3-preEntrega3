import express from "express";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import { HTTP_STATUS } from "./utils/constants.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: "ok", service: "shipnow-api" });
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: "Identificador inválido" });
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    error: err.message || "Error interno del servidor",
  });
});

export default app;