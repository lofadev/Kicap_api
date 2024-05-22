import mongoose, { Schema } from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderID: { type: String, required: true },
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shipper: { type: String, default: '' },
    orderTime: { type: Date, default: Date.now() },
    acceptTime: { type: Date, default: '' },
    shippedTime: { type: Date, default: '' },
    finishedTime: { type: Date, default: '' },
    status: { type: Number, required: true, default: 0 },
    deliveryAddress: { type: String, required: true },
    deliveryProvince: { type: String, required: true },
    email: { type: String, default: '' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String, default: '' },
    paymentMethod: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    shippingPrice: { type: Number, default: 0, required: true },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);
export default Order;
