import { User } from "../models/User.js";
import { USER_STATUS } from "../utils/constants.js";

const SAFE_USER_PROJECTION = "name email role status createdAt updatedAt";

class UserRepository {
  async findAll({ includeInactive = false } = {}) {
    const filter = includeInactive
      ? {}
      : { status: { $ne: USER_STATUS.INACTIVE } };

    return User.find(filter)
      .select(SAFE_USER_PROJECTION)
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id) {
    return User.findById(id).select(SAFE_USER_PROJECTION).lean();
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() })
      .select(SAFE_USER_PROJECTION)
      .lean();
  }

  async create(data) {
    const created = await User.create(data);
    return this.findById(created._id);
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, projection: SAFE_USER_PROJECTION }
    ).lean();
  }
}

export default new UserRepository();