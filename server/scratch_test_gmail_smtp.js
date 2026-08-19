import dotenv from 'dotenv';
dotenv.config();

import { sendOTPEmail } from './services/resendService.js';

async function testGmailSMTP() {
  console.log("Testing Nodemailer Gmail SMTP with GMAIL_USER:", process.env.GMAIL_USER);
  const result = await sendOTPEmail('nayakamareswar3@gmail.com', '549201');
  console.log("Result:", result);
}

testGmailSMTP();
