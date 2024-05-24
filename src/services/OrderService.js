import OrderDetail from '../models/OrderDetailModel.js';
import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js';
import Variant from '../models/VariantModel.js';

const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [order, orderDetails] = await Promise.all([
        Order.create(newOrder),
        OrderDetail.insertMany(newOrder.orderItems),
      ]);
      const productIDs = [];
      const variantIDs = [];
      console.log(newOrder.orderItems);
      if (newOrder.orderItems) {
        newOrder.orderItems.forEach((item) => {
          if (!!item.variant) variantIDs.push({ id: item.productID, quantity: item.quantity });
          else productIDs.push({ id: item.productID, quantity: item.quantity });
        });
      }
      const promiseProduct = productIDs.map(async (item) => {
        const product = await Product.findById(item.id);
        if (!product) {
          // Handle case where product is not found
          return null;
        }
        const updatedStock = product.stock - item.quantity;
        return Product.findByIdAndUpdate(item.id, { stock: updatedStock }, { new: true });
      });

      const promiseVariant = variantIDs.map(async (item) => {
        const variant = await Variant.findById(item.id);
        if (!variant) {
          // Handle case where variant is not found
          return null;
        }
        const updatedStock = variant.stock - item.quantity;
        return Variant.findByIdAndUpdate(item.id, { stock: updatedStock }, { new: true });
      });
      await Promise.all([...promiseProduct, ...promiseVariant]);

      if (order && orderDetails) {
        resolve({
          status: 'OK',
          message: 'Đặt hàng thành công.',
          data: order,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const updateIsPaid = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderIsPaid = await Order.findOneAndUpdate(
        { orderID: id },
        { isPaid: true },
        { new: true }
      );
      if (orderIsPaid) {
        resolve({
          status: 'OK',
          message: 'Đặt hàng thành công.',
          data: orderIsPaid,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAll = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { status, fromDate, toDate, page, limit } = payload;
      const skip = (page - 1) * limit;
      let query = { createdAt: { $gte: fromDate, $lt: toDate } };
      if (status) {
        query = { status, createdAt: { $gte: fromDate, $lt: toDate } };
      }
      const [orders, totalOrders] = await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(query),
      ]);
      const totalPage = Math.ceil(totalOrders / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách đơn đặt hàng.',
        data: orders,
        pagination: {
          currentPage: page,
          totalOrders,
          totalPage,
          limit,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(id);
      if (!order) {
        resolve({
          status: 'ERROR',
          message: 'Order này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Lấy thông tin chi tiết order.',
        data: order,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateOrder = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(id, payload, { new: true });
      if (updatedOrder) {
        resolve({
          status: 'OK',
          message: 'Cập nhật order thành công',
          data: updatedOrder,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const deleteOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const productsOrder = await OrderDetail.find({ orderID: id });
      const productIDs = [];
      const variantIDs = [];
      if (productsOrder.length) {
        productsOrder.forEach((item) => {
          if (!!item.variant) variantIDs.push({ id: item.productID, quantity: item.quantity });
          else productIDs.push({ id: item.productID, quantity: item.quantity });
        });
      }
      const promiseProduct = productIDs.map(async (item) => {
        const product = await Product.findById(item.id);
        if (!product) {
          // Handle case where product is not found
          return null;
        }
        const updatedStock = product.stock + item.quantity;
        return Product.findByIdAndUpdate(item.id, { stock: updatedStock }, { new: true });
      });

      const promiseVariant = variantIDs.map(async (item) => {
        const variant = await Variant.findById(item.id);
        if (!variant) {
          // Handle case where variant is not found
          return null;
        }
        const updatedStock = variant.stock + item.quantity;
        return Variant.findByIdAndUpdate(item.id, { stock: updatedStock }, { new: true });
      });
      const [deletedOrder, deletedOrderDetail, increaseProduct, increaseVariant] =
        await Promise.all([
          Order.findOneAndDelete({ orderID: id }),
          OrderDetail.deleteMany({ orderID: id }),
          ...promiseProduct,
          ...promiseVariant,
        ]);
      if (deletedOrder && deletedOrderDetail.deletedCount) {
        return resolve({
          status: 'OK',
          message: 'Đã xoá order thành công',
        });
      }
      resolve({
        status: 'OK',
        message: 'Order đã được xoá trước đó rồi.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const OrderService = { createOrder, updateIsPaid, deleteOrder, getAll, getOrder, updateOrder };
export default OrderService;
