import mongoose from 'mongoose';

const ProvinceSchema = new mongoose.Schema(
  {
    provinceId: { type: String, required: true, unique: true },
    provinceName: { type: String, required: true },
    provinceType: { type: String, required: true },
  },
  { timestamps: true }
);

const Province = mongoose.model('Province', ProvinceSchema);
export default Province;
