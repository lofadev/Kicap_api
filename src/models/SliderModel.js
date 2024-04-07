import mongoose from 'mongoose';

const SliderSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    description: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    toProduct: { type: String, default: '' },
  },
  { timestamps: true }
);

const Slider = mongoose.model('Slider', SliderSchema);
export default Slider;
