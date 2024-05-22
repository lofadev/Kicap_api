import OrderService from '../services/OrderService.js';
import variable from '../variable.js';

const createOrder = async (req, res) => {
  try {
    const {
      orderID,
      userID,
      deliveryAddress,
      deliveryProvince,
      fullName,
      phone,
      paymentMethod,
      shippingPrice,
      totalPrice,
      orderItems,
    } = req.body;
    if (
      !orderID ||
      !userID ||
      !deliveryAddress ||
      !deliveryProvince ||
      !fullName ||
      !phone ||
      !paymentMethod ||
      !totalPrice ||
      !orderItems.length
    ) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const payload = {
      orderID,
      userID,
      deliveryAddress,
      deliveryProvince,
      fullName,
      phone,
      paymentMethod,
      shippingPrice,
      totalPrice,
      orderItems,
    };
    const response = await OrderService.createOrder(payload);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getAll = async (req, res) => {
  try {
    const { status, fromDate, toDate, page, limit } = req.query;
    if (!fromDate || !toDate) {
      return res.status(400).json(variable.NOT_EMPTY);
    }

    const payload = {
      status,
      fromDate,
      toDate,
      page: Number(page || 1),
      limit: Number(limit || 10),
    };
    const response = await OrderService.getAll(payload);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const OrderController = {
  createOrder,
  getAll,
};

export default OrderController;
