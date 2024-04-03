import mongoose from 'mongoose';

const SliderSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    fileName: { type: String },
    displayOrder: { type: Number },
  },
  { timestamps: true }
);

const Slider = mongoose.model('Slider', SliderSchema);
export default Slider;
