import mongoose from 'mongoose';

const ShipperSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

const Shipper = mongoose.model('Shipper', ShipperSchema);
export default Shipper;
