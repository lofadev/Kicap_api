import ProductImage from '../models/ProductImageModel.js';
import Product from '../models/ProductModel.js';
import Variant from '../models/VariantModel.js';
import Category from '../models/CategoryModel.js';
import {
  convertToSlug,
  deleteImageFromFirebase,
  generateSKU,
  roundedPrice,
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
        const [variant, product] = await Promise.all([
          Variant.findOne({ sku }),
          Product.findOne({ sku }),
        ]);

        if (!variant && !product) {
          payload.sku = sku;
          break;
        }
      }
      payload.slug = convertToSlug(name);
      const imageUrl = await uploadImageToFirebase(payload.image);
      payload.image = imageUrl;
      payload.more_image = imageUrl;
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

const getProducts = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page, limit, search, category, sortBy, brand, price, stock } = payload;
      const skip = (page - 1) * limit;
      const [categories, brands] = await Promise.all([Category.find(), Product.find()]);

      const categoryArr = category.length > 0 ? category : categories.map((ct) => ct.categoryName);
      const categoryQuery = categoryArr.map((ct) => ({ category: ct }));

      const brandArr = brand.length > 0 ? brand : brands.map((br) => br.brand);
      const brandQuery = brandArr.map((br) => ({ brand: br }));

      let priceQuery = price.map((pr) => {
        if (pr[0] && pr[1]) {
          return {
            price: { $gt: pr[0], $lt: pr[1] },
          };
        }
        return {
          price: { $gt: pr[0] },
        };
      });
      if (priceQuery.length === 0) priceQuery = [{ price: { $gt: 0 } }];

      const stockQuery = stock ? [{ stock: { $gt: 0 } }] : [{ stock: { $gt: -1 } }];

      let sortByQuery;
      if (sortBy === 'created_on:desc') sortByQuery = { createdAt: -1 };
      else if (sortBy === 'alpha:asc') sortByQuery = { name: 1 };
      else if (sortBy === 'alpha:desc') sortByQuery = { name: -1 };
      else if (sortBy === 'price:asc') sortByQuery = { price: 1 };
      else if (sortBy === 'price:desc') sortByQuery = { price: -1 };

      const queryFind = {
        name: { $regex: search, $options: 'i' },
        $and: [
          { $or: categoryQuery },
          { $or: brandQuery },
          { $or: priceQuery },
          { $or: stockQuery },
        ],
      };
      let querySort;
      // if (search && category) queryFind = { name: { $regex: search, $options: 'i' }, category };
      // else if (search) queryFind = { name: { $regex: search, $options: 'i' } };
      // else if (category) queryFind = { category };
      const totalProducts = await Product.countDocuments(queryFind);
      const products = await Product.find(queryFind).sort(sortByQuery).skip(skip).limit(limit);
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
      const { image, price, discount } = payload;
      if (image) {
        const imageURL = await uploadImageToFirebase(image);
        payload.image = imageURL;
      }
      const salePrice = price - (price * discount) / 100;
      payload.salePrice = roundedPrice(salePrice);
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
      const imageUrls = images.map((image) => image.image);
      imageUrls.push(product.image);
      imageUrls.forEach(async (url) => {
        await deleteImageFromFirebase(url);
      });
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

const checkQuantityProduct = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [products, variants] = await Promise.all([
        Product.find({ _id: { $in: ids } }),
        Variant.find({ _id: { $in: ids } }),
      ]);
      const resData = [...products, ...variants].map((data) => {
        return {
          id: data._id,
          stock: data.stock,
        };
      });
      resolve({
        status: 'OK',
        message: 'Kiểm tra số lượng order so với số lượng tồn kho',
        data: resData,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getBrands = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await Product.find();
      const brands = [];
      products.forEach((product) => {
        if (!brands.includes(product.brand)) brands.push(product.brand);
      });
      resolve({
        status: 'OK',
        message: 'Lấy danh sách thương hiệu',
        data: brands,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getMenu = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const categories = await Category.find({});
      const promiseMenu = categories.map((ct) => {
        return Product.find({ category: ct.categoryName }).sort({ createdAt: -1 }).limit(3);
      });
      const results = await Promise.all(promiseMenu);
      const menu = results.map((result, index) => {
        return {
          id: categories[index]._id,
          name: categories[index].categoryName,
          sub_children: result.map((rs) => {
            return {
              id: rs._id,
              name: rs.name,
              slug: rs.slug,
            };
          }),
        };
      });
      resolve({
        status: 'OK',
        message: 'Lấy danh sách menu',
        data: menu,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const ProductService = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  checkQuantityProduct,
  getBrands,
  getMenu,
};
export default ProductService;
