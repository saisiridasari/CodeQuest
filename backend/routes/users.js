import { Router } from 'express';
import { getProfile, updateProfile, getPublicProfile, getDashboard, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getDashboard);
router.put('/change-password', protect, changePassword);
router.get('/public/:username', getPublicProfile);

export default router;
