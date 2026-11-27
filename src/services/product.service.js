import productRepository from "../repositories/product.repository.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorDictionary.js";
import { PRODUCT_STATUS } from "../utils/constants.js";

class ProductService {
  async listProducts() {
    return productRepository.findAll();
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        "Producto no encontrado"
      );
    }
    return product;
  }

  async createProduct(payload) {
    const { name, sku, price, stock = 0, status } = payload;

    if (!name || !sku || price === undefined) {
      throw new ValidationError("name, sku y price son obligatorios");
    }
    if (Number(price) < 0 || Number(stock) < 0) {
      throw new ValidationError("price y stock no pueden ser negativos");
    }

    const existingSku = await productRepository.findBySku(sku);
    if (existingSku) {
      throw new ConflictError(
        `Ya existe un producto con SKU ${sku.toUpperCase()}`
      );
    }

    const normalizedStock = Number(stock);
    const resolvedStatus =
      normalizedStock === 0
        ? PRODUCT_STATUS.OUT_OF_STOCK
        : status || PRODUCT_STATUS.ACTIVE;

    return productRepository.create({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      price: Number(price),
      stock: normalizedStock,
      status: resolvedStatus,
    });
  }

  async updateProduct(id, payload) {
    const current = await this.getProductById(id);
    const updates = { ...payload };

    if (updates.price !== undefined && Number(updates.price) < 0) {
      throw new ValidationError("El precio no puede ser negativo");
    }

    if (updates.stock !== undefined) {
      const nextStock = Number(updates.stock);
      if (nextStock < 0) {
        throw new ValidationError("El stock no puede ser negativo");
      }
      updates.stock = nextStock;

      if (nextStock === 0 && !updates.status) {
        updates.status = PRODUCT_STATUS.OUT_OF_STOCK;
      } else if (
        nextStock > 0 &&
        current.status === PRODUCT_STATUS.OUT_OF_STOCK &&
        !updates.status
      ) {
        updates.status = PRODUCT_STATUS.ACTIVE;
      }
    }

    if (updates.sku) {
      updates.sku = updates.sku.trim().toUpperCase();
      const duplicate = await productRepository.findBySku(updates.sku);
      if (duplicate && String(duplicate._id) !== String(id)) {
        throw new ConflictError(
          `Ya existe otro producto con SKU ${updates.sku}`
        );
      }
    }

    const updated = await productRepository.updateById(id, updates);
    if (!updated) {
      throw new NotFoundError(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        "No se pudo actualizar el producto"
      );
    }
    return updated;
  }

  async deleteProduct(id) {
    const deleted = await productRepository.softDeleteById(id);
    if (!deleted) {
      throw new NotFoundError(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        "Producto no encontrado"
      );
    }
    return deleted;
  }
}

export default new ProductService();