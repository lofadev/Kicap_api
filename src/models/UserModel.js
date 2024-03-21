import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    avatar: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    isAdmin: { type: Boolean, default: false, required: true },
    province: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;
