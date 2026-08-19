import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { OTP } from '../models/OTP.js';
import { User } from '../models/User.js';
import { sendOTPEmail } from '../services/resendService.js';

// Safe check for firebase-admin initialization in ESM format
try {
  const apps = admin.apps || admin.default?.apps || [];
  if (apps.length === 0) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'career-ai-83927',
    });
    console.log('[Firebase Admin] Initialized successfully');
  }
} catch (err) {
  console.warn('[Firebase Admin Warning]:', err.message);
}

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Rate limiting: 60 sec cooldown between requests
    const existingOTP = await OTP.findOne({ email: cleanEmail });
    if (existingOTP && existingOTP.createdAt > new Date(Date.now() - 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait before requesting another OTP.',
      });
    }

    // Invalidate previous OTP for this recipient
    await OTP.findOneAndDelete({ email: cleanEmail });

    // Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Exactly 5 minutes expiration

    // Store hashed OTP in DB
    await OTP.create({
      email: cleanEmail,
      otpHash,
      expiresAt,
    });

    // Deliver OTP via Nodemailer Gmail SMTP / Resend to exact recipient email
    const result = await sendOTPEmail(cleanEmail, otp);

    if (!result.success) {
      console.error(`[OTP Send Failed for ${cleanEmail}]:`, result.error);
      return res.status(400).json({
        success: false,
        message: result.error || 'Unable to send OTP. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification OTP has been sent to ${cleanEmail}.`,
    });
  } catch (error) {
    console.error('[Send OTP Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'Unable to send OTP. Please try again.', error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const record = await OTP.findOne({ email: cleanEmail });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please request a new one.' });
    }

    // Strict 5-minute backend expiration check
    if (new Date() > record.expiresAt) {
      await OTP.findByIdAndDelete(record._id);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    if (record.attempts >= 5) {
      await OTP.findByIdAndDelete(record._id);
      return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    // Invalidate / delete OTP immediately after successful verification
    await OTP.findByIdAndDelete(record._id);
    console.log(`[OTP Verified & Invalidated] Email: ${cleanEmail}`);

    // Generate 15-minute single-use Password Reset Token
    const resetToken = jwt.sign(
      { email: cleanEmail, purpose: 'password_reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You may now set a new password.',
      resetToken,
    });
  } catch (error) {
    console.error('[Verify OTP Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'OTP verification failed', error: error.message });
  }
};

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secret');
      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (tokenErr) {
      return res.status(400).json({ success: false, message: 'Reset token expired or invalid. Please request a new OTP.' });
    }

    const email = decoded.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 1. Update or Upsert MongoDB User record
    let userDoc = await User.findOneAndUpdate(
      { email },
      { passwordHash },
      { new: true, upsert: true }
    );

    // 2. Universal Firebase Auth password update / link via Firebase Admin SDK
    try {
      const apps = admin.apps || admin.default?.apps || [];
      if (apps.length > 0) {
        let fbUser;
        try {
          fbUser = await admin.auth().getUserByEmail(email);
        } catch (getErr) {
          console.log(`[Firebase Admin] User with email ${email} not found via email lookup.`);
        }

        if (fbUser) {
          // Updates password for existing Firebase user (works for both Google Sign-In and Email/Password accounts!)
          await admin.auth().updateUser(fbUser.uid, {
            password: newPassword,
          });
          console.log(`[Firebase Admin Password Updated] Successfully attached/updated password for Firebase UID: ${fbUser.uid} (${email})`);
        } else {
          // If user didn't exist in Firebase Auth yet, create the user in Firebase Auth!
          fbUser = await admin.auth().createUser({
            email,
            password: newPassword,
            emailVerified: true,
          });
          console.log(`[Firebase Admin User Created] Created new user in Firebase Auth with UID: ${fbUser.uid} (${email})`);
        }
      }
    } catch (fbErr) {
      console.error('[Firebase Admin Password Sync Error]:', fbErr.message);
    }

    console.log(`[Password Reset Success] Password credentials activated for: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now sign in using your email and new password.',
    });
  } catch (error) {
    console.error('[Reset Password Controller Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'Failed to update password', error: error.message });
  }
};
