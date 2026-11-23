import { ERROR_CODES, ERROR_DICTIONARY } from "./errorDictionary.js";

export class AppError extends Error {
  constructor(code = ERROR_CODES.INTERNAL_ERROR, message, details = null, statusCode) {
    const entry = ERROR_DICTIONARY[code] || ERROR_DICTIONARY[ERROR_CODES.INTERNAL_ERROR];
    super(message || entry.message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode || entry.statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null, code = ERROR_CODES.VALIDATION_ERROR) {
    super(code, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(code, message, details = null) {
    super(code, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null, code = ERROR_CODES.DUPLICATE_RESOURCE) {
    super(code, message, details);
  }
}

export class InvalidMockError extends AppError {
  constructor(code = ERROR_CODES.INVALID_MOCK_QTY, message, details = null) {
    super(code, message, details);
  }
}

export class SeedError extends AppError {
  constructor(message, details = null) {
    super(ERROR_CODES.SEED_FAILED, message, details);
  }
}