import userRepository from "../repositories/user.repository.js";
import { USER_ROLES, USER_STATUS } from "../utils/constants.js";

function createServiceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class UserService {
  async listUsers() {
    return userRepository.findAll();
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createServiceError("Usuario no encontrado", 404);
    }
    return user;
  }

  async createUser(payload) {
    const { name, email, role } = payload;

    if (!name || !email) {
      throw createServiceError("name y email son obligatorios", 400);
    }

    const resolvedRole = role || USER_ROLES.USER;
    if (!Object.values(USER_ROLES).includes(resolvedRole)) {
      throw createServiceError(
        `Rol inválido. Valores permitidos: ${Object.values(USER_ROLES).join(", ")}`,
        400
      );
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw createServiceError("El email ya está registrado", 409);
    }

    return userRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: resolvedRole,
      status: USER_STATUS.ACTIVE,
    });
  }

  async updateRole(id, role) {
    if (!Object.values(USER_ROLES).includes(role)) {
      throw createServiceError(
        `Rol inválido. Valores permitidos: ${Object.values(USER_ROLES).join(", ")}`,
        400
      );
    }

    await this.getUserById(id);
    return userRepository.updateById(id, { role });
  }
}

export default new UserService();