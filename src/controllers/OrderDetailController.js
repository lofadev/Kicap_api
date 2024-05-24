import OrderDetailService from '../services/OrderDetailService.js';
import variable from '../variable.js';

const getDetailsOfOrder = async (req, res) => {
  try {
    const { orderID } = req.query;
    const response = await OrderDetailService.getDetailsOfOrder(orderID);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(variable.HAS_ERROR);
  }
};

const updateOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, variant, quantity, price } = req.body;
    const payload = { name, variant, quantity, price };
    const response = await OrderDetailService.updateOrderDetails(id, payload);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(variable.HAS_ERROR);
  }
};
const deleteOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await OrderDetailService.deleteOrderDetails(id);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(variable.HAS_ERROR);
  }
};

const OrderDetailController = { getDetailsOfOrder, updateOrderDetails, deleteOrderDetails };
export default OrderDetailController;
