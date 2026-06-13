import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
    return null; // not configured
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,             // your Gmail address
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html }) => {
  const t = getTransporter();

  if (!t) {
    // Fallback — print to console (visible in Render logs)
    console.log('\n══════════════════════════════════════════');
    console.log('  EMAIL NOT CONFIGURED — check Render env vars');
    console.log(`  To: ${to} | Subject: ${subject}`);
    const otpMatch = html.match(/font-family:monospace[^>]*>(\d{6})</);
    const linkMatch = html.match(/href="([^"]*reset-password[^"]*)"/);
    if (otpMatch) console.log(`  ✉  OTP: ${otpMatch[1]}`);
    if (linkMatch) console.log(`  ✉  RESET LINK: ${linkMatch[1]}`);
    console.log('══════════════════════════════════════════\n');
    return;
  }

  try {
    const info = await t.sendMail({
      from: `"CodeQuest Pro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to} — MessageId: ${info.messageId}`);
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
    // Still extract OTP/link to console so user isn't completely stuck
    const otpMatch = html.match(/font-family:monospace[^>]*>(\d{6})</);
    const linkMatch = html.match(/href="([^"]*reset-password[^"]*)"/);
    if (otpMatch) console.log(`  FALLBACK OTP for ${to}: ${otpMatch[1]}`);
    if (linkMatch) console.log(`  FALLBACK RESET LINK: ${linkMatch[1]}`);
    throw err;
  }
};

export const sendOTPEmail = async (email, otp) => {
  await sendMail({
    to: email,
    subject: 'Your CodeQuest Pro Verification Code',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f8f9fe;border-radius:16px;">
        <h1 style="color:#6C5CE7;font-size:28px;margin:0 0 8px;">CodeQuest Pro</h1>
        <p style="color:#636e72;font-size:15px;margin:0 0 24px;">Your email verification code:</p>
        <div style="background:#fff;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;border:1px solid #e8e8f0;">
          <span style="font-size:40px;font-weight:700;letter-spacing:10px;color:#2d3436;font-family:monospace;">${otp}</span>
        </div>
        <p style="color:#636e72;font-size:13px;">Expires in <strong>10 minutes</strong>. Didn't request this? Ignore this email.</p>
      </div>`,
  });
};

export const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendMail({
    to: email,
    subject: 'Reset Your CodeQuest Pro Password',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f8f9fe;border-radius:16px;">
        <h1 style="color:#6C5CE7;font-size:28px;margin:0 0 8px;">Password Reset</h1>
        <p style="color:#636e72;margin:0 0 24px;">Click below to reset your password. Expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#6C5CE7;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">Reset Password</a>
        <p style="color:#b2bec3;font-size:12px;margin:24px 0 0;">Or copy: ${resetUrl}</p>
      </div>`,
  });
};