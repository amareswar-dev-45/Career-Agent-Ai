import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, max: 5 },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model('OTP', otpSchema);
