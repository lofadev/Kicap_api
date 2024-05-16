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

const OrderController = {
  createOrder,
};

export default OrderController;
