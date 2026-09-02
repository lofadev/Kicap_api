import 'dotenv/config';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import Attribute from '../src/models/AttributeModel.js';
import Category from '../src/models/CategoryModel.js';
import Comment from '../src/models/CommentModel.js';
import Order from '../src/models/OrderModel.js';
import OrderDetail from '../src/models/OrderDetailModel.js';
import OrderStatus from '../src/models/OrderStatusModel.js';
import Product from '../src/models/ProductModel.js';
import ProductImage from '../src/models/ProductImageModel.js';
import Province from '../src/models/ProvinceModel.js';
import Shipper from '../src/models/ShipperModel.js';
import Slider from '../src/models/SliderModel.js';
import Supplier from '../src/models/SupplierModel.js';
import User from '../src/models/UserModel.js';
import Variant from '../src/models/VariantModel.js';

import { convertToSlug, roundedPrice } from '../src/utils/index.js';
import * as data from './seed-data.js';

// Wipe and insert order. Independent collections first, then referents.
const COLLECTIONS = [
  ['Province', Province],
  ['OrderStatus', OrderStatus],
  ['Shipper', Shipper],
  ['Attribute', Attribute],
  ['Category', Category],
  ['Supplier', Supplier],
  ['User', User],
  ['Product', Product],
  ['Variant', Variant],
  ['ProductImage', ProductImage],
  ['Slider', Slider],
  ['Order', Order],
  ['OrderDetail', OrderDetail],
  ['Comment', Comment],
];

const confirmWipe = async () => {
  if (process.argv.includes('--yes')) return true;
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('\nXoá toàn bộ dữ liệu trên và seed lại? Gõ "y" để tiếp tục: ');
  rl.close();
  return answer.trim().toLowerCase() === 'y';
};

const printCounts = async (title) => {
  console.log(`\n${title}`);
  for (const [label, Model] of COLLECTIONS) {
    const count = await Model.countDocuments();
    console.log(`  ${label.padEnd(14)} ${String(count).padStart(4)}`);
  }
};

const seedReference = async () => {
  await Province.insertMany(data.provinces);
  await OrderStatus.insertMany(data.orderStatuses);
  await Shipper.insertMany(data.shippers);
  await Attribute.insertMany(data.attributes);
  await Category.insertMany(data.categories);
  await Supplier.insertMany(data.suppliers);
};

// price is the struck-through original; salePrice is what the customer pays
// (client/src/components/ProductCard/ProductCard.jsx:76-79).
const applyDiscount = (price, discount) => roundedPrice((price * (100 - discount)) / 100);

const seedCatalog = async () => {
  // `images` holds the real kicap.vn URLs; it feeds image, more_image and the
  // ProductImage rows below, and is not a field on ProductModel itself.
  const imagesByName = new Map(data.products.map((p) => [p.name, p.images]));

  const products = await Product.insertMany(
    data.products.map(({ images, ...p }) => ({
      ...p,
      slug: convertToSlug(p.name),
      salePrice: applyDiscount(p.price, p.discount),
      image: images[0],
      // ProductCard.jsx:68 swaps to more_image on hover; single-image products
      // simply do not change.
      more_image: images[1] ?? images[0],
      rating: 0,
    })),
  );

  const byName = new Map(products.map((p) => [p.name, p]));

  await Variant.insertMany(
    data.variants.map((v, index) => {
      const parent = byName.get(v.product);
      const price = parent.price + v.priceDelta;
      return {
        productID: parent._id,
        sku: v.sku,
        name: v.name,
        value: v.value,
        stock: v.stock,
        discount: parent.discount,
        price,
        salePrice: applyDiscount(price, parent.discount),
        displayOrder: index,
        toImageOrder: 0,
      };
    }),
  );

  await ProductImage.insertMany(
    products.flatMap((p) =>
      imagesByName.get(p.name).map((image, order) => ({
        productID: p._id,
        image,
        description: `${p.name} - ảnh ${order + 1}`,
        displayOrder: order,
        isHidden: false,
      })),
    ),
  );

  await Slider.insertMany(
    data.sliders.map((s) => ({
      image: s.image,
      description: s.description,
      displayOrder: s.displayOrder,
      toProduct: '/products',
    })),
  );

  return products;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Mirrors the transitions in OrderService.updateOrder:147-154 so seeded orders
// look exactly like ones the app produced itself.
const orderTimestamps = (orderTime, status) => {
  const stamps = { orderTime };
  if (status >= 1) stamps.acceptTime = new Date(orderTime.getTime() + 4 * HOUR);
  if (status >= 3) {
    stamps.shippedTime = new Date(orderTime.getTime() + 28 * HOUR);
    stamps.finishedTime = new Date(orderTime.getTime() + 52 * HOUR);
  }
  return stamps;
};

const seedCommerce = async (products) => {
  const userDocs = await User.insertMany(
    data.users.map((u) => ({
      ...u,
      password: bcrypt.hashSync(u.password, 10),
      isVerify: true,
      isLocked: 0,
      avatar: data.placeholderImage(u.name, '200x200'),
    })),
  );

  const userByEmail = new Map(userDocs.map((u) => [u.email, u]));
  const productByName = new Map(products.map((p) => [p.name, p]));
  const variantDocs = await Variant.find();
  const variantKey = (productID, name, value) => `${productID}|${name}|${value}`;
  const variantByKey = new Map(variantDocs.map((v) => [variantKey(v.productID.toString(), v.name, v.value), v]));

  const now = Date.now();
  const orderDocs = [];
  const detailDocs = [];

  data.orders.forEach((order, index) => {
    const customer = userByEmail.get(order.customer);
    const orderTime = new Date(now - order.daysAgo * DAY);
    const orderID = randomUUID();

    let itemsTotal = 0;
    for (const item of order.items) {
      const product = productByName.get(item.product);
      let unitPrice = product.salePrice;

      if (item.variant) {
        const [attribute, value] = item.variant.split('/');
        unitPrice = variantByKey.get(variantKey(product._id.toString(), attribute, value)).salePrice;
      }

      itemsTotal += unitPrice * item.quantity;
      detailDocs.push({
        orderID,
        productID: product._id.toString(),
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: unitPrice,
        variant: item.variant,
        createdAt: orderTime,
        updatedAt: orderTime,
      });
    }

    orderDocs.push({
      orderID,
      userID: customer._id,
      // A shipper is assigned when the order moves to status 2 (DetailOrder.jsx:78).
      shipper: order.status >= 2 ? data.shippers[index % data.shippers.length].name : '',
      ...orderTimestamps(orderTime, order.status),
      status: order.status,
      deliveryAddress: customer.address,
      deliveryProvince: customer.province,
      email: customer.email,
      fullName: customer.name,
      phone: customer.phone,
      note: order.note,
      paymentMethod: order.paymentMethod,
      isPaid: order.status === 3 || order.paymentMethod === 'VNPAY',
      shippingPrice: order.shippingPrice,
      totalPrice: itemsTotal + order.shippingPrice,
      createdAt: orderTime,
      updatedAt: orderTime,
    });
  });

  await Order.insertMany(orderDocs);
  await OrderDetail.insertMany(detailDocs);

  await Comment.insertMany(
    data.comments.map((c) => ({
      user: c.user,
      content: c.content,
      rating: c.rating,
      product_id: productByName.get(c.product)._id,
    })),
  );
};

// Product.rating is a denormalised average; the app has no job that maintains
// it, so the seed computes it once from the comments it just inserted.
const recomputeRatings = async () => {
  const grouped = await Comment.aggregate([{ $group: { _id: '$product_id', average: { $avg: '$rating' } } }]);

  await Promise.all(
    grouped.map(({ _id, average }) => Product.updateOne({ _id }, { rating: Math.round(average * 10) / 10 })),
  );
};

const run = async () => {
  const url = process.env.MONGODB_URL;
  if (!url) {
    console.error('Thiếu MONGODB_URL. Kiểm tra server/.env.');
    process.exit(1);
  }

  await mongoose.connect(url);
  const { host, port, name } = mongoose.connection;
  console.log(`\nMongoDB : ${host}:${port}`);
  console.log(`Database: ${name}`);
  await printCounts('Số document sẽ bị xoá:');

  if (!(await confirmWipe())) {
    console.log('Đã huỷ, không thay đổi gì.');
    await mongoose.disconnect();
    return;
  }

  // deleteMany on exactly these collections — never dropDatabase, so other
  // databases on the same mongod are untouched.
  for (const [, Model] of COLLECTIONS) await Model.deleteMany({});

  await seedReference();
  const products = await seedCatalog();
  await seedCommerce(products);
  await recomputeRatings();

  await printCounts('Đã seed xong:');
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('\nSeed thất bại:', error);
  await mongoose.disconnect();
  process.exit(1);
});
