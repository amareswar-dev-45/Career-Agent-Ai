import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, default: 'Student' },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, default: '' },
    photoURL: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    atsScore: { type: Number, default: 0 },
    targetDomain: { type: String, default: 'Software Engineering' },
    dreamCompany: { type: String, default: 'Google' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
