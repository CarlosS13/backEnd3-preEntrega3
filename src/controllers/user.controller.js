import userService from "../services/user.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.listUsers();
      res.status(HTTP_STATUS.OK).json({ data: users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(HTTP_STATUS.OK).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(HTTP_STATUS.CREATED).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const user = await userService.updateRole(req.params.id, req.body.role);
      res.status(HTTP_STATUS.OK).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();