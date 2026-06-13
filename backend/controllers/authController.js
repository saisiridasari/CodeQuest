import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, setTokenCookies } from '../utils/jwt.js';
import { sendOTPEmail, sendResetPasswordEmail } from '../services/emailService.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    const user = await User.create({ username, email, password });
    const otp = generateOTP();
    await OTP.create({ email, otp, type: 'verification', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    try {
      await sendOTPEmail(email, otp);
    } catch {
      /* email send failure is non-fatal in dev */
    }
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: { userId: user._id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, type: 'verification' }).sort({ createdAt: -1 });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
    }
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteMany({ email, type: 'verification' });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    await OTP.deleteMany({ email, type: 'verification' });
    const otp = generateOTP();
    await OTP.create({ email, otp, type: 'verification', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    try { await sendOTPEmail(email, otp); } catch { /* non-fatal */ }
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first', needsVerification: true, email: user.email });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    // Update streak
    const now = new Date();
    const lastActive = user.lastActiveDate;
    if (lastActive) {
      const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak += 1;
        if (user.streak > user.longestStreak) user.longestStreak = user.streak;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = now;
    await user.save();
    setTokenCookies(res, accessToken, refreshToken);
    const { password: _, refreshToken: __, ...userData } = user.toObject();
    res.json({ success: true, data: { user: userData, accessToken, refreshToken } });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' });
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    setTokenCookies(res, accessToken, refreshToken);
    res.json({ success: true, data: { accessToken, refreshToken } });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    try { await sendResetPasswordEmail(email, resetToken); } catch { /* non-fatal */ }
    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.refreshToken = null;
    await user.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  const { password, refreshToken, ...userData } = req.user.toObject();
  res.json({ success: true, data: userData });
};
