import { HTTP_STATUS } from "../utils/constants.js";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES, ERROR_DICTIONARY } from "../errors/errorDictionary.js";

function normalizeError(err) {
  if (err instanceof AppError) {
    return err;
  }

  if (err?.name === "CastError") {
    return new AppError(
      ERROR_CODES.INVALID_ID,
      `El valor '${err.value}' no es un identificador válido`,
      { field: err.path }
    );
  }

  if (err?.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Error de validación en los datos enviados",
      details
    );
  }

  if (err?.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return new AppError(
      ERROR_CODES.DUPLICATE_RESOURCE,
      "Ya existe un registro con esos datos únicos",
      { fields, values: err.keyValue }
    );
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "El cuerpo de la petición no tiene un JSON válido"
    );
  }

  const fallback = ERROR_DICTIONARY[ERROR_CODES.INTERNAL_ERROR];
  return new AppError(
    ERROR_CODES.INTERNAL_ERROR,
    fallback.message,
    null,
    err?.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

export function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err);

  if (!normalized.isOperational || normalized.statusCode >= 500) {
    console.error("[ErrorHandler]", {
      method: req.method,
      path: req.originalUrl,
      code: normalized.code,
      message: normalized.message,
      originalError: err?.message,
    });
  }

  res.status(normalized.statusCode).json({
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details ?? null,
    },
  });
}