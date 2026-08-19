import dotenv from 'dotenv';
dotenv.config();

import { sendOTPEmail } from './services/resendService.js';

async function run() {
  console.log("Testing OTP email for nayakamareswar3@gmail.com...");
  const result = await sendOTPEmail('nayakamareswar3@gmail.com', '984123');
  console.log("Result:", result);
}

run();
