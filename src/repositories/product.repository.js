import { Product } from "../models/Product.js";
import { PRODUCT_STATUS } from "../utils/constants.js";

const DEFAULT_PROJECTION = "name sku price stock status createdAt updatedAt";

class ProductRepository {
  async findAll({ includeDeleted = false } = {}) {
    const filter = includeDeleted
      ? {}
      : { status: { $ne: PRODUCT_STATUS.DELETED } };

    return Product.find(filter)
      .select(DEFAULT_PROJECTION)
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id, { includeDeleted = false } = {}) {
    const filter = { _id: id };
    if (!includeDeleted) {
      filter.status = { $ne: PRODUCT_STATUS.DELETED };
    }

    return Product.findOne(filter).select(DEFAULT_PROJECTION).lean();
  }

  async findBySku(sku) {
    return Product.findOne({ sku: sku.toUpperCase() })
      .select(DEFAULT_PROJECTION)
      .lean();
  }

  async create(data) {
    const created = await Product.create(data);
    return this.findById(created._id, { includeDeleted: true });
  }

  async updateById(id, updateData) {
    return Product.findOneAndUpdate(
      { _id: id, status: { $ne: PRODUCT_STATUS.DELETED } },
      { $set: updateData },
      { new: true, runValidators: true, projection: DEFAULT_PROJECTION }
    ).lean();
  }

  async softDeleteById(id) {
    return Product.findOneAndUpdate(
      { _id: id, status: { $ne: PRODUCT_STATUS.DELETED } },
      { $set: { status: PRODUCT_STATUS.DELETED } },
      { new: true, projection: DEFAULT_PROJECTION }
    ).lean();
  }

  async insertMany(productsData) {
    return Product.insertMany(productsData, { ordered: true });
  }
}

export default new ProductRepository();