import OrderStatusService from '../services/OrderStatusService.js';

import variable from '../variable.js';

const createOrderStatus = async (req, res) => {
  try {
    const { status, description } = req.body;
    if (!status || !description) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    const response = await OrderStatusService.createOrderStatus(req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getOrderStatuss = async (req, res) => {
  try {
    const response = await OrderStatusService.getOrderStatuss();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await OrderStatusService.getOrderStatus(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await OrderStatusService.updateOrderStatus(id, req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await OrderStatusService.deleteOrderStatus(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const OrderStatusController = {
  createOrderStatus,
  getOrderStatuss,
  getOrderStatus,
  updateOrderStatus,
  deleteOrderStatus,
};
export default OrderStatusController;
