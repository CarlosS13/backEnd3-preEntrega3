import mockService from "../services/mock.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

class MockController {
  getUsers(req, res, next) {
    try {
      const { qty, role } = req.query;
      const users = mockService.previewUsers(qty, role);
      res.status(HTTP_STATUS.OK).json(users);
    } catch (error) {
      next(error);
    }
  }

  getOrders(req, res, next) {
    try {
      const { qty } = req.query;
      const orders = mockService.previewOrders(qty);
      res.status(HTTP_STATUS.OK).json(orders);
    } catch (error) {
      next(error);
    }
  }

  getDeliveries(req, res, next) {
    try {
      const { qty } = req.query;
      const deliveries = mockService.previewDeliveries(qty);
      res.status(HTTP_STATUS.OK).json(deliveries);
    } catch (error) {
      next(error);
    }
  }

  async seed(req, res, next) {
    try {
      const qty = req.query.qty ?? req.body?.qty ?? 10;
      const entity = req.query.entity ?? req.body?.entity ?? "users";
      const result = await mockService.seedCollection(entity, qty);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new MockController();