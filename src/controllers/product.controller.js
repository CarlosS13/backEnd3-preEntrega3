import productService from "../services/product.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

class ProductController {
  async getAll(req, res, next) {
    try {
      const products = await productService.listProducts();
      res.status(HTTP_STATUS.OK).json({ data: products });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(HTTP_STATUS.OK).json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(HTTP_STATUS.CREATED).json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(HTTP_STATUS.OK).json({ message: "Producto eliminado" });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();