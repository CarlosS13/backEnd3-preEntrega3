import mongoose from "mongoose";
import { DELIVERY_STATUS } from "../utils/constants.js";

const deliverySchema = new mongoose.Schema(
  {
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    courier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.UNASSIGNED,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Delivery = mongoose.model("Delivery", deliverySchema);