import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export const sendOTPEmail = async (email, otp) => {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  console.log('[OTP] Request received');
  console.log(`[OTP] Recipient: ${email}`);
  console.log('[OTP] Generating OTP');
  console.log('[OTP] Sending email');

  // 1. Primary Email Transport: Nodemailer + Gmail SMTP
  if (gmailUser && gmailPass) {
    try {
      const cleanPass = gmailPass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: cleanPass,
        },
      });

      // Verify SMTP connection configuration
      await transporter.verify();

      const info = await transporter.sendMail({
        from: `CareerAI <${gmailUser}>`,
        to: email,
        subject: 'Your CareerAI Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 28px; background-color: #f8f9ff; color: #121c2a; border-radius: 12px;">
            <h2 style="color: #4648d4; margin-bottom: 12px;">CareerAI Verification Code</h2>
            <p style="font-size: 15px; color: #464554;">Your one-time verification code for CareerAI is:</p>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 2px solid #4648d4; font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; color: #4648d4; margin: 24px 0;">
              ${otp}
            </div>
            <p style="color: #767586; font-size: 13px;">This OTP is valid for 5 minutes. Do not share this OTP with anyone.</p>
            <hr style="border: none; border-top: 1px solid #e6eeff; margin-top: 24px;" />
            <p style="font-size: 12px; color: #767586; text-align: center;">Developed by Amareswar Nayak • CareerAI Student Hub</p>
          </div>
        `,
      });

      console.log(`[OTP] SMTP accepted message for ${email} (MessageID: ${info.messageId})`);
      return { success: true, provider: 'gmail_smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.error(`[OTP SMTP Error for ${email}]:`, smtpErr.message);
    }
  }

  // 2. Fallback Email Transport: Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: 'CareerAI <onboarding@resend.dev>',
        to: [email],
        subject: 'Your CareerAI Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f8f9ff;">
            <h2 style="color: #4648d4;">CareerAI Verification Code</h2>
            <p style="font-size: 24px; font-weight: bold; color: #4648d4;">${otp}</p>
            <p style="color: #767586;">This OTP is valid for 5 minutes.</p>
          </div>
        `,
      });

      if (!error && data) {
        console.log(`[OTP] Resend accepted message for ${email}`);
        return { success: true, provider: 'resend', data };
      }
    } catch (resendErr) {
      console.error(`[OTP Resend Error for ${email}]:`, resendErr.message);
    }
  }

  // Failed delivery
  return {
    success: false,
    error: 'Unable to send OTP email. Please verify email address or server credentials.',
  };
};
