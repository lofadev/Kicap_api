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
      const results = await Promise.all([...promiseProduct, ...promiseVariant]);

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
      if (deletedOrder && deletedOrderDetail.deletedCount && increaseProduct && increaseVariant) {
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

const OrderService = { createOrder, updateIsPaid, deleteOrder };
export default OrderService;
