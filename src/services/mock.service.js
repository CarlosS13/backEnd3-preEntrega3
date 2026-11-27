import mongoose from "mongoose";
import { fakerES as faker } from "@faker-js/faker";
import userRepository from "../repositories/user.repository.js";
import productRepository from "../repositories/product.repository.js";
import orderRepository from "../repositories/order.repository.js";
import deliveryRepository from "../repositories/delivery.repository.js";
import { InvalidMockError, SeedError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorDictionary.js";
import {
  DELIVERY_STATUS,
  ORDER_PRIORITY,
  ORDER_STATUS,
  PRODUCT_STATUS,
  USER_ROLES,
  USER_STATUS,
} from "../utils/constants.js";

function parseQuantity(rawQty, defaultQty = 5, maxQty = 100) {
  if (rawQty === undefined) return defaultQty;
  const parsed = Number(rawQty);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maxQty) {
    throw new InvalidMockError(
      ERROR_CODES.INVALID_MOCK_QTY,
      `El parámetro qty debe ser un entero entre 1 y ${maxQty}`
    );
  }
  return parsed;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

class MockService {
  buildMockUsers(qty = 5, forcedRole = null) {
    const count = parseQuantity(qty);
    const allowedRoles = [USER_ROLES.USER, USER_ROLES.COURIER, USER_ROLES.ADMIN];

    return Array.from({ length: count }, (_, idx) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const role =
        forcedRole ||
        (idx % 3 === 1 ? USER_ROLES.COURIER : randomFrom(allowedRoles));

      const uniqueSuffix = `${Date.now().toString(36)}${idx}${faker.string.alphanumeric(3).toLowerCase()}`;
      const cleanEmail = `${firstName}.${lastName}.${uniqueSuffix}@shipnow-test.com`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");

      return {
        _id: new mongoose.Types.ObjectId(),
        name: `${firstName} ${lastName}`,
        email: cleanEmail,
        role,
        status: USER_STATUS.ACTIVE,
      };
    });
  }

  buildMockProducts(qty = 5) {
    const count = parseQuantity(qty);

    return Array.from({ length: count }, (_, idx) => {
      const stock = faker.number.int({ min: 5, max: 120 });
      return {
        _id: new mongoose.Types.ObjectId(),
        name: `${faker.commerce.productName()} (${faker.commerce.productMaterial()})`,
        sku: `SN-${Date.now().toString(36).toUpperCase()}-${idx}-${faker.string.alphanumeric(4).toUpperCase()}`,
        price: Number(faker.commerce.price({ min: 500, max: 50000, dec: 0 })),
        stock,
        status: PRODUCT_STATUS.ACTIVE,
      };
    });
  }

  buildMockOrders(qty = 5, customers = [], products = []) {
    const count = parseQuantity(qty);
    const resolvedCustomers =
      customers.length > 0
        ? customers
        : this.buildMockUsers(Math.max(2, count), USER_ROLES.USER);
    const resolvedProducts =
      products.length > 0 ? products : this.buildMockProducts(Math.max(3, count));

    const statuses = Object.values(ORDER_STATUS);
    const priorities = Object.values(ORDER_PRIORITY);

    return Array.from({ length: count }, (_, idx) => {
      const customer = randomFrom(resolvedCustomers);
      const selectedProduct = randomFrom(resolvedProducts);
      const quantity = faker.number.int({ min: 1, max: 4 });
      const unitPrice = selectedProduct.price;
      const totalAmount = unitPrice * quantity;

      return {
        _id: new mongoose.Types.ObjectId(),
        code: `ORD-${Date.now().toString(36).toUpperCase()}-${idx + 1}-${faker.string.alphanumeric(3).toUpperCase()}`,
        customer: customer._id,
        items: [
          {
            product: selectedProduct._id,
            quantity,
            unitPrice,
          },
        ],
        totalAmount,
        status: randomFrom(statuses),
        priority: randomFrom(priorities),
        shippingAddress: `${faker.location.streetAddress()}, ${faker.location.city()}`,
      };
    });
  }

  buildMockDeliveries(qty = 5, orders = [], couriers = []) {
    const count = parseQuantity(qty);
    const resolvedOrders =
      orders.length > 0 ? orders : this.buildMockOrders(count);
    const resolvedCouriers =
      couriers.length > 0
        ? couriers
        : this.buildMockUsers(Math.max(2, Math.ceil(count / 2)), USER_ROLES.COURIER);

    const deliveryStatuses = Object.values(DELIVERY_STATUS);

    return Array.from({ length: count }, (_, idx) => {
      const order = resolvedOrders[idx % resolvedOrders.length];
      const status = randomFrom(deliveryStatuses);
      const requiresCourier = status !== DELIVERY_STATUS.UNASSIGNED;
      const assignedCourier = requiresCourier
        ? randomFrom(resolvedCouriers)
        : null;

      return {
        _id: new mongoose.Types.ObjectId(),
        trackingCode: `TRK-${Date.now().toString(36).toUpperCase()}-${idx + 1}-${faker.string.alphanumeric(4).toUpperCase()}`,
        order: order._id,
        courier: assignedCourier ? assignedCourier._id : null,
        status,
        estimatedDeliveryDate: faker.date.soon({ days: 5 }),
      };
    });
  }

  previewUsers(qty, role) {
    if (role && !Object.values(USER_ROLES).includes(role)) {
      throw new InvalidMockError(
        ERROR_CODES.INVALID_ROLE,
        `Rol inválido. Valores permitidos: ${Object.values(USER_ROLES).join(", ")}`
      );
    }
    return this.buildMockUsers(qty, role || null).map(({ _id, ...rest }) => rest);
  }

  previewOrders(qty) {
    return this.buildMockOrders(qty);
  }

  previewDeliveries(qty) {
    return this.buildMockDeliveries(qty);
  }

  async seedCollection(entity = "users", qty = 10) {
    const count = parseQuantity(qty);
    const normalizedEntity = String(entity || "").toLowerCase();

    const validEntities = [
      "users",
      "usuarios",
      "couriers",
      "repartidores",
      "products",
      "productos",
      "orders",
      "pedidos",
      "deliveries",
      "entregas",
      "all",
      "completo",
    ];

    if (!validEntities.includes(normalizedEntity)) {
      throw new InvalidMockError(
        ERROR_CODES.INVALID_MOCK_ENTITY,
        "Entidad inválida para seed. Opciones: users, couriers, products, orders, deliveries, all"
      );
    }

    try {
      if (normalizedEntity === "users" || normalizedEntity === "usuarios") {
        const users = this.buildMockUsers(count);
        const inserted = await userRepository.insertMany(users);
        return { insertados: inserted.length, coleccion: "usuarios" };
      }

      if (normalizedEntity === "couriers" || normalizedEntity === "repartidores") {
        const couriers = this.buildMockUsers(count, USER_ROLES.COURIER);
        const inserted = await userRepository.insertMany(couriers);
        return { insertados: inserted.length, coleccion: "repartidores" };
      }

      if (normalizedEntity === "products" || normalizedEntity === "productos") {
        const products = this.buildMockProducts(count);
        const inserted = await productRepository.insertMany(products);
        return { insertados: inserted.length, coleccion: "productos" };
      }

      if (normalizedEntity === "orders" || normalizedEntity === "pedidos") {
        const customers = await userRepository.insertMany(
          this.buildMockUsers(Math.max(2, Math.ceil(count / 2)), USER_ROLES.USER)
        );
        const products = await productRepository.insertMany(
          this.buildMockProducts(Math.max(3, Math.ceil(count / 2)))
        );
        const orders = this.buildMockOrders(count, customers, products);
        const inserted = await orderRepository.insertMany(orders);
        return { insertados: inserted.length, coleccion: "pedidos" };
      }

      if (normalizedEntity === "deliveries" || normalizedEntity === "entregas") {
        const customers = await userRepository.insertMany(
          this.buildMockUsers(Math.max(2, Math.ceil(count / 2)), USER_ROLES.USER)
        );
        const couriers = await userRepository.insertMany(
          this.buildMockUsers(Math.max(2, Math.ceil(count / 2)), USER_ROLES.COURIER)
        );
        const products = await productRepository.insertMany(
          this.buildMockProducts(Math.max(3, Math.ceil(count / 2)))
        );
        const orders = await orderRepository.insertMany(
          this.buildMockOrders(count, customers, products)
        );
        const deliveries = this.buildMockDeliveries(count, orders, couriers);
        const inserted = await deliveryRepository.insertMany(deliveries);
        return { insertados: inserted.length, coleccion: "entregas" };
      }

      const customers = await userRepository.insertMany(
        this.buildMockUsers(count, USER_ROLES.USER)
      );
      const couriers = await userRepository.insertMany(
        this.buildMockUsers(Math.max(2, Math.ceil(count / 2)), USER_ROLES.COURIER)
      );
      const products = await productRepository.insertMany(
        this.buildMockProducts(count)
      );
      const orders = await orderRepository.insertMany(
        this.buildMockOrders(count, customers, products)
      );
      const deliveries = await deliveryRepository.insertMany(
        this.buildMockDeliveries(count, orders, couriers)
      );

      return {
        insertados: {
          usuarios: customers.length,
          repartidores: couriers.length,
          productos: products.length,
          pedidos: orders.length,
          entregas: deliveries.length,
        },
        coleccion: "completo",
      };
    } catch (error) {
      if (error instanceof InvalidMockError) {
        throw error;
      }
      throw new SeedError(
        `Error al cargar datos de prueba para '${normalizedEntity}'`,
        { entity: normalizedEntity, reason: error.message }
      );
    }
  }
}

export default new MockService();