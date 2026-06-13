import nodemailer from 'nodemailer';

let transporter = null;

const buildTransporter = () => {
  // MODE 1: OAuth2
  if (
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN &&
    process.env.EMAIL_USER
  ) {
    console.log('📧 Email: using Gmail OAuth2');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  }

  // MODE 2: App Password
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('📧 Email: using Gmail App Password');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  console.warn('⚠️  Email: no credentials set — OTPs will print to console only');
  return null;
};

const getTransporter = () => {
  if (!transporter) transporter = buildTransporter();
  return transporter;
};

// ── Core send ────────────────────────────────────
export const sendMail = async ({ to, subject, html }) => {
  const t = getTransporter();

  if (!t) {
    logFallback(to, subject, html);
    return { fallback: true };
  }

  try {
    const info = await t.sendMail({
      from: `"CodeQuest Pro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent → ${to} | id: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email FAILED → ${to}`);
    console.error(`   Error: ${err.message}`);
    if (err.response) console.error(`   SMTP Response: ${err.response}`);
    logFallback(to, subject, html);
    throw err;
  }
};

const logFallback = (to, subject, html) => {
  const otpMatch = html.match(/>(\d{6})<\/span>/);
  const linkMatch = html.match(/href="([^"]*reset-password[^"]*)"/);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📬 EMAIL FALLBACK — To: ${to}`);
  console.log(`   Subject: ${subject}`);
  if (otpMatch)  console.log(`   🔑 OTP CODE  : ${otpMatch[1]}`);
  if (linkMatch) console.log(`   🔗 RESET URL : ${linkMatch[1]}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
};

// ── Test connection (used by /api/health/email) ──
export const testEmailConnection = async () => {
  const t = getTransporter();
  if (!t) return { ok: false, reason: 'No credentials configured' };
  try {
    await t.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
};

// ── Templates ───────────────────────────────────
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
        <p style="color:#636e72;font-size:13px;">Expires in <strong>10 minutes</strong>.</p>
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