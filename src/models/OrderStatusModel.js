import mongoose from 'mongoose';

const OrderStatusSchema = new mongoose.Schema(
  {
    status: { type: Number, required: true, unique: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const OrderStatus = mongoose.model('OrderStatus', OrderStatusSchema);
export default OrderStatus;
