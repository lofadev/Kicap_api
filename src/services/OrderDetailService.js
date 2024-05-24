import Order from '../models/OrderModel.js';
import OrderDetail from '../models/OrderDetailModel.js';

const getDetailsOfOrder = (orderID) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderDetails = await OrderDetail.find({ orderID });
      resolve({
        status: 'OK',
        message: 'Lấy danh sách các mặt hàng trong order',
        data: orderDetails,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateOrderDetails = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedOrderDetails = await OrderDetail.findByIdAndUpdate(id, payload, { new: true });
      if (updateOrderDetails) {
        const orderID = updatedOrderDetails.orderID;
        const orderDetails = await OrderDetail.find({ orderID });
        const totalPrice = orderDetails.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const updatedTotalPrice = await Order.findOneAndUpdate(
          { orderID },
          { totalPrice },
          { new: true }
        );
        if (updatedTotalPrice) {
          resolve({
            status: 'OK',
            message: 'Cập nhật sản phẩm trong order thành công.',
            data: updatedOrderDetails,
          });
        }
      }
      resolve({
        status: 'ERROR',
        message: 'Sản phẩm trong order này không tồn tại.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const deletedOrderDetails = await OrderDetail.findByIdAndDelete(id);
      if (deletedOrderDetails) {
        const orderID = deletedOrderDetails.orderID;
        const orderDetails = await OrderDetail.find({ orderID });
        const totalPrice = orderDetails.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const updatedTotalPrice = await Order.findOneAndUpdate(
          { orderID },
          { totalPrice },
          { new: true }
        );
        if (updatedTotalPrice) {
          resolve({
            status: 'OK',
            message: 'Xoá sản phẩm trong order thành công.',
            data: deleteOrderDetails,
          });
        }
      }
      resolve({
        status: 'ERROR',
        message: 'Sản phẩm này không tồn tại trong order.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const OrderDetailService = { getDetailsOfOrder, updateOrderDetails, deleteOrderDetails };
export default OrderDetailService;
