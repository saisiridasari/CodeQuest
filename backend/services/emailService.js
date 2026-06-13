import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();

  const configs = {
    // Option 1: Gmail (works locally, unreliable on cloud)
    gmail: {
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    },
    // Option 2: Brevo/Sendinblue (free 300/day, works everywhere)
    brevo: {
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    },
    // Option 3: Outlook/Hotmail
    outlook: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    },
    // Option 4: Any custom SMTP
    custom: {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    },
  };

  transporter = nodemailer.createTransport(configs[provider] || configs.gmail);
  return transporter;
};

const isConfigured = () => !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const sendMail = async (mailOptions) => {
  if (!isConfigured()) {
    console.log('\n══════════════════════════════════════');
    console.log('  EMAIL NOT CONFIGURED — printing to console');
    console.log(`  To: ${mailOptions.to}`);
    console.log(`  Subject: ${mailOptions.subject}`);
    // Extract OTP or link from HTML
    const otpMatch = mailOptions.html?.match(/letter-spacing[^>]*>(\d{6})</);
    const linkMatch = mailOptions.html?.match(/href="([^"]*reset-password[^"]*)"/);
    if (otpMatch) console.log(`  ➜ OTP CODE: ${otpMatch[1]}`);
    if (linkMatch) console.log(`  ➜ RESET LINK: ${linkMatch[1]}`);
    console.log('══════════════════════════════════════\n');
    return;
  }

  try {
    await getTransporter().sendMail(mailOptions);
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Log the critical info to console so user isn't stuck
    const otpMatch = mailOptions.html?.match(/letter-spacing[^>]*>(\d{6})</);
    const linkMatch = mailOptions.html?.match(/href="([^"]*reset-password[^"]*)"/);
    if (otpMatch) console.log(`  FALLBACK — OTP for ${mailOptions.to}: ${otpMatch[1]}`);
    if (linkMatch) console.log(`  FALLBACK — Reset link: ${linkMatch[1]}`);
    throw err;
  }
};

export const sendOTPEmail = async (email, otp) => {
  await sendMail({
    from: `"CodeQuest Pro" <${process.env.EMAIL_USER || 'noreply@codequest.io'}>`,
    to: email,
    subject: 'Verify Your CodeQuest Pro Account',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f8f9fe;border-radius:16px;">
        <h1 style="color:#6C5CE7;font-size:28px;margin-bottom:8px;">CodeQuest Pro</h1>
        <p style="color:#636e72;font-size:15px;">Your verification code is:</p>
        <div style="background:#fff;border-radius:12px;padding:24px;text-align:center;margin:24px 0;border:1px solid #e8e8f0;">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#2d3436;">${otp}</span>
        </div>
        <p style="color:#636e72;font-size:13px;">This code expires in 10 minutes.</p>
      </div>`,
  });
};

export const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendMail({
    from: `"CodeQuest Pro" <${process.env.EMAIL_USER || 'noreply@codequest.io'}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f8f9fe;border-radius:16px;">
        <h1 style="color:#6C5CE7;font-size:28px;margin-bottom:8px;">Password Reset</h1>
        <p style="color:#636e72;">Click below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#6C5CE7;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;margin:24px 0;">Reset Password</a>
      </div>`,
  });
};