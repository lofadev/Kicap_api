import Product from '../models/ProductModel.js';
import User from '../models/UserModel.js';
import ProductCategory from '../models/CategoryModel.js';
import Order from '../models/OrderModel.js';

const getDashBoard = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const [countProduct, countUser, countProductCategory, countOrder] = await Promise.all([
        Product.countDocuments(),
        User.countDocuments(),
        ProductCategory.countDocuments(),
        Order.countDocuments(),
      ]);
      resolve({
        status: 'OK',
        message: 'Lấy thông tin cho trang dashboard',
        data: {
          product: countProduct,
          user: countUser,
          category: countProductCategory,
          order: countOrder,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getRevenue = (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { month, year } = params;
      const query = { status: 4 };
      const orders = await Order.find({});
      resolve({
        status: 'OK',
        message: 'Lấy thông tin cho trang dashboard',
        // data: revenue,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const DashboardService = { getDashBoard, getRevenue };
export default DashboardService;
