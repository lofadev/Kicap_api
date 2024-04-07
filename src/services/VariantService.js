import Variant from '../models/VariantModel.js';
import { generateSKU } from '../utils/index.js';

const createVariant = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { value } = payload;
      const variant = await Variant.findOne({ value });
      if (variant) {
        return resolve({
          status: 'ERROR',
          message: 'Tên biến thể của sản phẩm này đã tồn tại.',
        });
      }
      while (true) {
        const sku = generateSKU();
        const variant = await Variant.findOne({ sku });
        if (!variant) {
          payload.sku = sku;
          break;
        }
      }
      const variantCreated = await Variant.create(payload);
      resolve({
        status: 'OK',
        message: 'Thêm mới biến thể của sản phẩm thành công.',
        data: variantCreated,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getVariants = (productID) => {
  return new Promise(async (resolve, reject) => {
    try {
      const variants = await Variant.find({ productID });
      if (variants)
        resolve({
          status: 'OK',
          message: 'Lấy danh sách biến thể của sản phẩm.',
          data: variants,
        });
    } catch (error) {
      reject(error);
    }
  });
};

const getVariant = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const variant = await Variant.findById(id);
      if (!variant) {
        resolve({
          status: 'ERROR',
          message: 'Biến thể của sản phẩm này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Lấy biến thể của sản phẩm thành công.',
        data: variant,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateVariant = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newVariant = await Variant.findByIdAndUpdate(id, data, { new: true });
      if (!newVariant) {
        resolve({
          status: 'ERROR',
          message: 'Biến thể của sản phẩm này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Cập nhật biến thể của sản phẩm thành công.',
        data: newVariant,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteVariant = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const variant = await Variant.findByIdAndDelete(id);
      if (!variant) {
        resolve({
          status: 'ERROR',
          message: 'Biến thể của sản phẩm này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Đã xóa biến thể của sản phẩm thành công.',
        data: variant,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const VariantService = {
  createVariant,
  getVariant,
  getVariants,
  updateVariant,
  deleteVariant,
};
export default VariantService;
