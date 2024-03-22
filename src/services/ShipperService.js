import Shipper from '../models/ShipperModel.js';

const createShipper = (newShipper) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, phone } = newShipper;
      const shipper = await Shipper.find({ phone });
      if (shipper) {
        resolve({
          status: 'ERROR',
          message: 'Số điện thoại này đã tồn tại.',
          data: shipperCreated,
        });
      }
      const shipperCreated = await Shipper.create({ name, phone });
      resolve({
        status: 'OK',
        message: 'Thêm mới shipper thành công.',
        data: shipperCreated,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getShippers = (page, limit, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit;
      let shippers, totalPage;
      let totalShippers = await Shipper.count();
      if (search) {
        shippers = await Shipper.find({ name: { $regex: search, $options: 'i' } })
          .skip(skip)
          .limit(limit);
        totalShippers = shippers.length;
      } else {
        shippers = await Shipper.find().skip(skip).limit(limit);
      }
      totalPage = Math.ceil(totalShippers / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách shippers.',
        data: shippers,
        currentPage: page,
        totalShippers,
        totalPage,
        limit,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getShipper = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const shipper = await Shipper.findById(id);
      if (shipper) {
        return resolve({
          status: 'OK',
          message: 'Lấy shipper thành công.',
          data: shipper,
        });
      }
      resolve({
        status: 'ERROR',
        message: 'Shipper ID Không hợp lệ.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateShipper = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const shipper = await Shipper.findById(id);
      if (!shipper) {
        return resolve({
          status: 'ERROR',
          message: 'Shipper này không tồn tại.',
        });
      }
      const newShipper = await Shipper.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: 'OK',
        message: 'Cập nhật shipper thành công.',
        data: newShipper,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteShipper = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const shipper = await Shipper.findByIdAndDelete(id);
      if (!shipper) {
        return resolve({
          status: 'ERROR',
          message: 'Shipper này không tồn tại.',
        });
      }

      resolve({
        status: 'OK',
        message: 'Đã xóa shipper thành công.',
        data: shipper,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const ShipperService = {
  createShipper,
  getShippers,
  getShipper,
  updateShipper,
  deleteShipper,
};
export default ShipperService;
