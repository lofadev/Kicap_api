import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    address: { type: String },
    isAdmin: { type: Boolean, default: false, required: true },
    avatar: { type: String },
    province: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;
