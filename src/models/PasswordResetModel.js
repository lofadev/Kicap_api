import mongoose from 'mongoose';

const PasswordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    token: { type: String, required: true },
    expiredTime: { type: Date, required: true },
  },
  { timestamps: true }
);

const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);
export default PasswordReset;
