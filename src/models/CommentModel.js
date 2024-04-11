import mongoose, { Schema } from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;
