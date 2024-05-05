import Variant from '../models/VariantModel.js';
import Product from '../models/ProductModel.js';
import { generateSKU } from '../utils/index.js';

const createVariant = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { value, price, discount } = payload;
      const variant = await Variant.findOne({ value });
      if (variant) {
        return resolve({
          status: 'ERROR',
          message: 'Tên biến thể của sản phẩm này đã tồn tại.',
        });
      }
      while (true) {
        const sku = generateSKU();
        const [variant, product] = await Promise.all([
          Variant.findOne({ sku }),
          Product.findOne({ sku }),
        ]);

        if (!variant && !product) {
          payload.sku = sku;
          break;
        }
      }
      const salePrice = price - (price * discount) / 100;
      payload.salePrice = salePrice;
      const [variantCreated] = await Promise.all([
        Variant.create(payload),
        Product.findByIdAndUpdate(payload.productID, { hasVariant: true }, { new: true }),
      ]);
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

const updateVariant = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const salePrice = payload.price - (payload.price * payload.discount) / 100;
      payload.salePrice = salePrice;
      const newVariant = await Variant.findByIdAndUpdate(id, payload, { new: true });
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
      const productID = variant.productID;
      const totalVariantOfProduct = await Variant.countDocuments({ productID });
      if (totalVariantOfProduct === 0) {
        await Product.findByIdAndUpdate(productID, { hasVariant: false });
      }
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
