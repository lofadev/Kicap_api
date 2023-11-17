const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    phone: { type: Number },
    address: { type: String },
    first_name: { type: String },
    last_name: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
