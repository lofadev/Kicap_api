import mongoose from 'mongoose';

const ProductSchema = mongoose.Schema({
  title: { type: String, unique: true, required: true },
  description: { type: String },
});
