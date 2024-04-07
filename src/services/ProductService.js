import ProductImage from '../models/ProductImageModel.js';
import Product from '../models/ProductModel.js';
import Variant from '../models/VariantModel.js';
import {
  convertToSlug,
  deleteImageFromFirebase,
  generateSKU,
  uploadImageToFirebase,
} from '../utils/index.js';
import variable from '../variable.js';

const createProduct = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name } = payload;
      const existedProduct = await Product.findOne({ name });
      if (existedProduct) {
        resolve({
          status: 'ERROR',
          message: 'Sản phẩm này đã tồn tại.',
        });
      }
      while (true) {
        const sku = generateSKU();
        const product = await Product.findOne({ sku });
        if (!product) {
          payload.sku = sku;
          break;
        }
      }
      const slug = convertToSlug(name);
      payload.slug = slug;
      const imageUrl = await uploadImageToFirebase(payload.image);
      payload.image = imageUrl;
      const product = await Product.create(payload);
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
      resolve({
        status: 'OK',
        message: 'Lấy sản phẩm.',
        data: product,
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
      const products = await Product.find(query).skip(skip).limit(limit);
      const totalPage = Math.ceil(totalProducts / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách sản phẩm.',
        data: products,
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

const updateProduct = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { image } = payload;
      if (image) {
        const imageURL = await uploadImageToFirebase(image);
        payload.image = imageURL;
      }
      const newProduct = await Product.findByIdAndUpdate(id, payload, { new: true });
      if (!newProduct) {
        resolve({
          status: 'ERROR',
          message: 'Sản phẩm này không tồn tại.',
        });
      }
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
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        resolve({
          status: 'ERROR',
          message: 'Sản phẩm này không tồn tại.',
        });
      }
      const [images, variants] = await Promise.all([
        ProductImage.find({ productID: id }),
        Variant.deleteMany({ productID: id }),
      ]);
      console.time('deleteImages');
      const imageUrls = images.map((image) => image.image);
      imageUrls.push(product.image);
      imageUrls.forEach(async (url) => {
        await deleteImageFromFirebase(url);
      });
      console.timeEnd('deleteImages');
      resolve({
        status: 'OK',
        message: 'Đã xóa sản phẩm thành công.',
        data: {
          product,
          images,
          variants,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

const ProductService = { createProduct, getProduct, getProducts, updateProduct, deleteProduct };
export default ProductService;
