import { Router } from 'express';
import { register, verifyOTP, resendOTP, login, refreshAccessToken, forgotPassword, resetPassword, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
