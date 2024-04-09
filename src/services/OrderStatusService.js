import OrderStatus from '../models/OrderStatusModel.js';

const createOrderStatus = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { status } = payload;
      const orderStatus = await OrderStatus.findOne({ status });
      if (orderStatus) {
        resolve({
          status: 'ERROR',
          message: 'Trạng thái đơn hàng này đã tồn tại.',
        });
      }
      const orderStatusCreated = await OrderStatus.create(payload);
      resolve({
        status: 'OK',
        message: 'Thêm trạng thái đơn hàng thành công.',
        data: orderStatusCreated,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getOrderStatuss = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderStatuses = await OrderStatus.find();
      resolve({
        status: 'OK',
        message: 'Lấy danh sách trạng thái đơn hàng.',
        data: orderStatuses,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getOrderStatus = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderStatus = await OrderStatus.findById(id);
      if (!orderStatus) {
        resolve({
          status: 'ERROR',
          message: 'Trạng thái đơn hàng này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Lấy trạng thái đơn hàng thành công.',
        data: orderStatus,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateOrderStatus = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newOrderStatus = await OrderStatus.findByIdAndUpdate(id, payload, { new: true });
      if (!newOrderStatus) {
        resolve({
          status: 'ERROR',
          message: 'Trạng thái đơn hàng này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Cập nhật trạng thái đơn hàng thành công.',
        data: newOrderStatus,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteOrderStatus = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderStatus = await OrderStatus.findByIdAndDelete(id);
      if (!orderStatus) {
        resolve({
          status: 'ERROR',
          message: 'Trạng thái đơn hàng này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Đã xóa trạng thái đơn hàng thành công.',
        data: orderStatus,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const OrderStatusService = {
  createOrderStatus,
  getOrderStatus,
  getOrderStatuss,
  updateOrderStatus,
  deleteOrderStatus,
};
export default OrderStatusService;
