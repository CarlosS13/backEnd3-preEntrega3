import productRepository from "../repositories/product.repository.js";
import { PRODUCT_STATUS } from "../utils/constants.js";

function createServiceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class ProductService {
  async listProducts() {
    return productRepository.findAll();
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw createServiceError("Producto no encontrado", 404);
    }
    return product;
  }

  async createProduct(payload) {
    const { name, sku, price, stock = 0, status } = payload;

    if (!name || !sku || price === undefined) {
      throw createServiceError("name, sku y price son obligatorios", 400);
    }
    if (Number(price) < 0 || Number(stock) < 0) {
      throw createServiceError("price y stock no pueden ser negativos", 400);
    }

    const existingSku = await productRepository.findBySku(sku);
    if (existingSku) {
      throw createServiceError(`Ya existe un producto con SKU ${sku.toUpperCase()}`, 409);
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
      throw createServiceError("El precio no puede ser negativo", 400);
    }

    if (updates.stock !== undefined) {
      const nextStock = Number(updates.stock);
      if (nextStock < 0) {
        throw createServiceError("El stock no puede ser negativo", 400);
      }
      updates.stock = nextStock;

      if (nextStock === 0 && !updates.status) {
        updates.status = PRODUCT_STATUS.OUT_OF_STOCK;
      } else if (nextStock > 0 && current.status === PRODUCT_STATUS.OUT_OF_STOCK && !updates.status) {
        updates.status = PRODUCT_STATUS.ACTIVE;
      }
    }

    if (updates.sku) {
      updates.sku = updates.sku.trim().toUpperCase();
      const duplicate = await productRepository.findBySku(updates.sku);
      if (duplicate && String(duplicate._id) !== String(id)) {
        throw createServiceError(`Ya existe otro producto con SKU ${updates.sku}`, 409);
      }
    }

    const updated = await productRepository.updateById(id, updates);
    if (!updated) {
      throw createServiceError("No se pudo actualizar el producto", 404);
    }
    return updated;
  }

  async deleteProduct(id) {
    const deleted = await productRepository.softDeleteById(id);
    if (!deleted) {
      throw createServiceError("Producto no encontrado", 404);
    }
    return deleted;
  }
}

export default new ProductService();