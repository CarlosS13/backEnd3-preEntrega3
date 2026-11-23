import { HTTP_STATUS } from "../utils/constants.js";

export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_ID: "INVALID_ID",
  INVALID_STATUS: "INVALID_STATUS",
  INVALID_ROLE: "INVALID_ROLE",
  INVALID_MOCK_QTY: "INVALID_MOCK_QTY",
  INVALID_MOCK_ENTITY: "INVALID_MOCK_ENTITY",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  DELIVERY_NOT_FOUND: "DELIVERY_NOT_FOUND",
  DUPLICATE_RESOURCE: "DUPLICATE_RESOURCE",
  SEED_FAILED: "SEED_FAILED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
});

export const ERROR_DICTIONARY = Object.freeze({
  [ERROR_CODES.VALIDATION_ERROR]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: "Datos de entrada inválidos",
  },
  [ERROR_CODES.INVALID_ID]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: "Identificador inválido",
  },
  [ERROR_CODES.INVALID_STATUS]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: "Estado inválido",
  },
  [ERROR_CODES.INVALID_ROLE]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: "Rol de usuario inválido",
  },
  [ERROR_CODES.INVALID_MOCK_QTY]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: "Cantidad de mocks inválida",
  },
  [ERROR_CODES.INVALID_MOCK_ENTITY]: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: "Entidad de mocks inválida",
  },
  [ERROR_CODES.USER_NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: "Usuario no encontrado",
  },
  [ERROR_CODES.PRODUCT_NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: "Producto no encontrado",
  },
  [ERROR_CODES.ORDER_NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: "Pedido no encontrado",
  },
  [ERROR_CODES.DELIVERY_NOT_FOUND]: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: "Entrega no encontrada",
  },
  [ERROR_CODES.DUPLICATE_RESOURCE]: {
    statusCode: HTTP_STATUS.CONFLICT,
    message: "El recurso ya existe",
  },
  [ERROR_CODES.SEED_FAILED]: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Error al cargar datos de prueba en la base de datos",
  },
  [ERROR_CODES.INTERNAL_ERROR]: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Error interno del servidor",
  },
});