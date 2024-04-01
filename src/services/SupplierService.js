import Supplier from '../models/SupplierModel.js';

const createSupplier = (newSupplier) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, contactName, province, address, phone, email } = newSupplier;
      const [supplierByPhone, supplierByEmail] = await Promise.all([
        Supplier.findOne({ phone }),
        Supplier.findOne({ email }),
      ]);
      if (supplierByPhone) {
        resolve({
          status: 'ERROR',
          message: 'Số điện thoại này đã tồn tại.',
        });
      }
      if (supplierByEmail) {
        resolve({
          status: 'ERROR',
          message: 'Email này đã tồn tại.',
        });
      }
      const supplierCreated = await Supplier.create({
        name,
        contactName,
        province,
        address,
        phone,
        email,
      });
      resolve({
        status: 'OK',
        message: 'Thêm mới nhà cung cấp thành công.',
        data: supplierCreated,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getSuppliers = (page, limit, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit;
      let query;
      if (search) query = { name: { $regex: search, $options: 'i' } };
      const totalSuppliers = await Supplier.countDocuments(query);
      const suppliers = await Supplier.find(query).skip(skip).limit(limit);
      const totalPage = Math.ceil(totalSuppliers / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách nhà cung cấp.',
        data: suppliers,
        currentPage: page,
        totalSuppliers,
        totalPage,
        limit,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getSupplier = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const supplier = await Supplier.findById(id);
      if (supplier) {
        resolve({
          status: 'OK',
          message: 'Lấy 1 nhà cung cấp thành công.',
          data: supplier,
        });
      }
      resolve({
        status: 'ERROR',
        message: 'Nhà cung cấp này không tồn tại.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateSupplier = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const supplier = await Supplier.findById(id);
      if (!supplier) {
        resolve({
          status: 'ERROR',
          message: 'Nhà cung cấp này không tồn tại.',
        });
      }
      const newSupplier = await Supplier.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: 'OK',
        message: 'Cập nhật nhà cung cấp thành công.',
        data: newSupplier,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteSupplier = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const supplier = await Supplier.findByIdAndDelete(id);
      if (!supplier) {
        resolve({
          status: 'ERROR',
          message: 'Nhà cung cấp này không tồn tại.',
        });
      }

      resolve({
        status: 'OK',
        message: 'Đã xóa nhà cung cấp thành công.',
        data: supplier,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const SupplierService = {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
};
export default SupplierService;
