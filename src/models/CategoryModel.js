import mongoose from 'mongoose';

const CategoryScheme = new mongoose.Schema(
  {
    categoryName: { type: String, unique: true, required: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', CategoryScheme);
export default Category;
