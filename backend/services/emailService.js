import nodemailer from 'nodemailer';

// Lazy-init — created on first send, after dotenv has loaded
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const isEmailConfigured = () =>
  !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

export const sendOTPEmail = async (email, otp) => {
  // Dev fallback — log to console when SMTP isn't set up
  if (!isEmailConfigured()) {
    console.log('\n╔══════════════════════════════════════╗');
    console.log(`║  OTP for ${email}: ${otp}  ║`);
    console.log('╚══════════════════════════════════════╝\n');
    return;
  }

  await getTransporter().sendMail({
    from: `"CodeQuest Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your CodeQuest Pro Account',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f8f9fe;border-radius:16px;">
        <h1 style="color:#6C5CE7;font-size:28px;margin-bottom:8px;">CodeQuest Pro</h1>
        <p style="color:#636e72;font-size:15px;">Your verification code is:</p>
        <div style="background:#fff;border-radius:12px;padding:24px;text-align:center;margin:24px 0;border:1px solid #e8e8f0;">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#2d3436;">${otp}</span>
        </div>
        <p style="color:#636e72;font-size:13px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  if (!isEmailConfigured()) {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log(`║  Password reset link for ${email}:`);
    console.log(`║  ${resetUrl}`);
    console.log('╚══════════════════════════════════════════════╝\n');
    return;
  }

  await getTransporter().sendMail({
    from: `"CodeQuest Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f8f9fe;border-radius:16px;">
        <h1 style="color:#6C5CE7;font-size:28px;margin-bottom:8px;">Password Reset</h1>
        <p style="color:#636e72;">Click below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#6C5CE7;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;margin:24px 0;">Reset Password</a>
      </div>
    `,
  });
};