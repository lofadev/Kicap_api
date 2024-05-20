import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    displayOrder: { type: Number, defautl: 0 },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductImage = mongoose.model('ProductImage', ImageSchema);
export default ProductImage;
