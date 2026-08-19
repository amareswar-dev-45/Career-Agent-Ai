import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

async function testSendOwner() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CareerAI <onboarding@resend.dev>',
      to: ['amareswarnayak02@gmail.com'],
      subject: 'CareerAI — Verification OTP Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f8f9ff; color: #121c2a;">
          <h2 style="color: #4648d4;">CareerAI Verification Code</h2>
          <p>Your test verification code is:</p>
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #c7c4d7; font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #4648d4; margin: 20px 0;">
            849201
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend API Error Response:", error);
    } else {
      console.log("Resend API Success:", data);
    }
  } catch (err) {
    console.error("Resend Exception:", err);
  }
}

testSendOwner();
