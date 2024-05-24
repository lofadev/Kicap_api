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
    const payload = {
      status,
      fromDate: fromDate ? fromDate : new Date().setMonth(new Date().getMonth() - 1),
      toDate: toDate ? toDate : Date.now(),
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

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await OrderService.getOrder(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await OrderService.deleteOrder(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await OrderService.updateOrder(id, req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const OrderController = {
  createOrder,
  getAll,
  getOrder,
  deleteOrder,
  updateOrder,
};

export default OrderController;
