import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    address: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;
