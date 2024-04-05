import ProductImage from '../models/ProductImageModel.js';
import Product from '../models/ProductModel.js';
import Variant from '../models/VariantModel.js';
import { generateSKU } from '../utils/index.js';
import variable from '../variable.js';

const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name } = newProduct;
      const existedProduct = await Product.findOne({ name });
      if (existedProduct) {
        resolve({
          status: 'ERROR',
          message: 'Sản phẩm này đã tồn tại.',
        });
      }
      const count = await Product.countDocuments();
      const sku = generateSKU(count);
      newProduct.sku = sku;
      const product = await Product.create(newProduct);
      resolve({
        status: 'OK',
        message: 'Thêm mới sản phẩm thành công.',
        data: product,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(id);
      if (!product) resolve(variable.ID_NOTVALID);
      const [images, variants] = await Promise.all([
        Variant.find({ _id: product._id }),
        ProductImage.find({ _id: product._id }),
      ]);
      const data = {
        ...product,
        variants,
        images,
      };
      resolve({
        status: 'OK',
        message: 'Lấy sản phẩm.',
        data: data,
      });
    } catch (error) {
      reject(error);
    }
  });
};
const getProducts = (page, limit, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit;
      let query;
      if (search) query = { name: { $regex: search, $options: 'i' } };
      const totalProducts = await Product.countDocuments(query);
      const suppliers = await Product.find(query).skip(skip).limit(limit);
      const totalPage = Math.ceil(totalProducts / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách sản phẩm.',
        data: suppliers,
        currentPage: page,
        totalProducts,
        totalPage,
        limit,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const supplier = await Product.findById(id);
      if (!supplier) {
        resolve({
          status: 'ERROR',
          message: 'Sản phẩm này không tồn tại.',
        });
      }
      const newProduct = await Product.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: 'OK',
        message: 'Cập nhật sản phẩm thành công.',
        data: newProduct,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const supplier = await Product.findByIdAndDelete(id);
      if (!supplier) {
        resolve({
          status: 'ERROR',
          message: 'Sản phẩm này không tồn tại.',
        });
      }

      resolve({
        status: 'OK',
        message: 'Đã xóa sản phẩm thành công.',
        data: supplier,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const ProductService = { createProduct, getProduct, getProducts, updateProduct, deleteProduct };
export default ProductService;
