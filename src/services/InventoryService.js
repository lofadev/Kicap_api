import Product from '../models/ProductModel.js';

const getItemsInInventory = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page, search, limit } = payload;
      const orderStatuses = await Product.find();
      resolve({
        status: 'OK',
        message: 'Lấy danh sách mặt hàng trong kho hàng.',
        data: orderStatuses,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getItemInInventory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderStatus = await Inventory.findById(id);
      if (!orderStatus) {
        resolve({
          status: 'ERROR',
          message: 'Trạng thái đơn hàng này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Lấy mặt hàng trong kho hàng thành công.',
        data: orderStatus,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateItemInInventory = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newInventory = await Inventory.findByIdAndUpdate(id, payload, { new: true });
      if (!newInventory) {
        resolve({
          status: 'ERROR',
          message: 'Trạng thái đơn hàng này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Cập nhật mặt hàng trong kho hàng thành công.',
        data: newInventory,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteItemInInventory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderStatus = await Inventory.findByIdAndDelete(id);
      if (!orderStatus) {
        resolve({
          status: 'ERROR',
          message: 'Trạng thái đơn hàng này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Đã xóa mặt hàng trong kho hàng thành công.',
        data: orderStatus,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const InventoryService = {
  getItemInInventory,
  getItemsInInventory,
  updateItemInInventory,
  deleteItemInInventory,
};
export default InventoryService;
