import express from 'express';
import { sendOTP, verifyOTP, resetPasswordWithOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);
router.post('/reset-password', resetPasswordWithOTP);

export default router;
