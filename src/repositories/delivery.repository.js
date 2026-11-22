import { Delivery } from "../models/Delivery.js";

class DeliveryRepository {
  async findAll() {
    return Delivery.find()
      .populate("order", "code status priority totalAmount")
      .populate("courier", "name email role")
      .sort({ createdAt: -1 })
      .lean();
  }

  async insertMany(deliveriesData) {
    return Delivery.insertMany(deliveriesData, { ordered: true });
  }
}

export default new DeliveryRepository();