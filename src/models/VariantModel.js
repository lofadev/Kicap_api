import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema(
  {
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: String, required: true },
    stock: { type: Number, required: true, default: 1 },
    discount: { type: Number, default: 0, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    displayOrder: { type: Number, default: 0 },
    toImageOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Variant = mongoose.model('Variant', VariantSchema);
export default Variant;
