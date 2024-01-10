import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true },
  description: { type: String },
  type: { type: String, required: true },
  sku: { type: Array },
  brand: { type: String },
  price: { type: Array, required: true },
  discount: { type: Array },
  count_in_stock: { type: Array },
  color: { type: Array },
  layout: { type: Array },
  species: { type: Array },
  switch: { type: Array },
  comments: { type: Array },
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;
