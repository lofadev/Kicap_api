import mongoose from 'mongoose';

const SliderSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    url: { type: String, default: '' },
    fileName: { type: String },
  },
  { timestamps: true }
);

const Slider = mongoose.model('Slider', SliderSchema);
export default Slider;
