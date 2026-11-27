import userRepository from "../repositories/user.repository.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorDictionary.js";
import { USER_ROLES, USER_STATUS } from "../utils/constants.js";

class UserService {
  async listUsers() {
    return userRepository.findAll();
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "Usuario no encontrado");
    }
    return user;
  }

  async createUser(payload) {
    const { name, email, role } = payload;

    if (!name || !email) {
      throw new ValidationError("name y email son obligatorios");
    }

    const resolvedRole = role || USER_ROLES.USER;
    if (!Object.values(USER_ROLES).includes(resolvedRole)) {
      throw new ValidationError(
        `Rol inválido. Valores permitidos: ${Object.values(USER_ROLES).join(", ")}`,
        null,
        ERROR_CODES.INVALID_ROLE
      );
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("El email ya está registrado");
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
      throw new ValidationError(
        `Rol inválido. Valores permitidos: ${Object.values(USER_ROLES).join(", ")}`,
        null,
        ERROR_CODES.INVALID_ROLE
      );
    }

    await this.getUserById(id);
    return userRepository.updateById(id, { role });
  }
}

export default new UserService();