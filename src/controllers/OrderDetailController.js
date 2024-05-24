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

const OrderDetailController = { getDetailsOfOrder };
export default OrderDetailController;
