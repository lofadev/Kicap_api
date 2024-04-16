import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    description: { type: String },
    sku: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    supplier: { type: String, required: true },
    discount: { type: Number, default: 0 },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    stock: { type: Number, required: true, default: 1 },
    image: { type: String, required: true },
    more_image: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    slug: { type: String, required: true },
    hasVariant: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);
export default Product;
