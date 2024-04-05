import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  attributeID: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute', required: true },
  name: { type: String, required: true },
  stock: { type: Number, required: true },
  discount: { type: Number, default: 0, required: true },
  quantitySell: { type: Number, default: 1, required: true },
  price: { type: Number, required: true },
  toImageOrder: { type: Number },
});

const Variant = mongoose.model('Variant', VariantSchema);
export default Variant;
