import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    province: { type: String, required: true },
  },
  { timestamps: true }
);

const Supplier = mongoose.model('Supplier', SupplierSchema);
export default Supplier;
