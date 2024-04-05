import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String },
  sku: { type: String, required: true },
  brand: { type: String, required: true },
  categoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  supplierID: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  discount: { type: Number, default: 0 },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  rating: { type: Number, default: 0 },
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;
