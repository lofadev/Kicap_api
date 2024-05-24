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

const OrderDetailService = { getDetailsOfOrder };
export default OrderDetailService;
