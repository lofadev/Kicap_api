import ProductImage from '../models/ProductImageModel.js';
import { deleteImageFromFirebase, uploadImageToFirebase } from '../utils/index.js';
import variable from '../variable.js';

const createProductImage = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { image } = payload;
      const imageUrl = await uploadImageToFirebase(image);
      payload.image = imageUrl;
      const productImage = await ProductImage.create(payload);
      resolve({
        status: 'OK',
        message: 'Thêm mới ảnh của sản phẩm thành công.',
        data: productImage,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getProductImage = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const productImage = await ProductImage.findById(id);
      if (!productImage) resolve(variable.ID_NOTVALID);
      resolve({
        status: 'OK',
        message: 'Lấy ảnh của sản phẩm.',
        data: productImage,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getProductImages = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const productImages = await ProductImage.find({ productID: id });
      resolve({
        status: 'OK',
        message: 'Lấy thư mục ảnh của sản phẩm.',
        data: productImages,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateProductImage = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { image } = payload;
      if (image) {
        const imageURL = await uploadImageToFirebase(image);
        payload.image = imageURL;
      }
      const newProductImage = await ProductImage.findByIdAndUpdate(id, payload, { new: true });
      if (!newProductImage) {
        resolve({
          status: 'ERROR',
          message: 'Ảnh của sản phẩm này không tồn tại',
        });
      }
      resolve({
        status: 'OK',
        message: 'Cập nhật ảnh của sản phẩm thành công.',
        data: newProductImage,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteProductImage = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const productImage = await ProductImage.findByIdAndDelete(id);
      if (!productImage) {
        resolve({
          status: 'ERROR',
          message: 'Ảnh của sản phẩm này không tồn tại',
        });
      }
      if (productImage.image) {
        await deleteImageFromFirebase(productImage.image);
      }
      resolve({
        status: 'OK',
        message: 'Đã xóa ảnh của sản phẩm thành công.',
        data: productImage,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getMaxOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const maxOrder = await ProductImage.find({ productID: id })
        .sort({ displayOrder: -1 })
        .limit(1);
      if (maxOrder.length) {
        resolve({
          status: 'OK',
          message: 'Lấy thứ tự hiển thị lớn nhất của product image.',
          data: maxOrder[0]?.displayOrder,
        });
      }
      resolve({
        status: 'OK',
        message: 'Lấy thứ tự hiển thị lớn nhất của product image.',
        data: 0,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const ProductService = {
  createProductImage,
  getProductImage,
  getProductImages,
  updateProductImage,
  deleteProductImage,
  getMaxOrder,
};
export default ProductService;
