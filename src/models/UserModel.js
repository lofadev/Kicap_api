import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    avatar: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    address: { type: String, default: '' },
    province: { type: String, default: '' },
    isLocked: { type: Number, default: 0 },
    isVerify: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;
