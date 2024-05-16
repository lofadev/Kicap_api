import OrderDetail from '../models/OrderDetailModel.js';
import Order from '../models/OrderModel.js';

const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [order, orderDetails] = await Promise.all([
        Order.create(newOrder),
        OrderDetail.insertMany(newOrder.orderItems),
      ]);
      if (order && orderDetails) {
        resolve({
          status: 'OK',
          message: 'Đặt hàng thành công.',
          data: order,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const OrderService = { createOrder };
export default OrderService;
