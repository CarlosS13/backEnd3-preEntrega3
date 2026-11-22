import { Order } from "../models/Order.js";

class OrderRepository {
  async findAll() {
    return Order.find()
      .populate("customer", "name email role")
      .sort({ createdAt: -1 })
      .lean();
  }

  async insertMany(ordersData) {
    return Order.insertMany(ordersData, { ordered: true });
  }
}

export default new OrderRepository();