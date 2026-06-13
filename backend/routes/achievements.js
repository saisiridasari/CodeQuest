import { Router } from 'express';
import { getAchievements, getUserAchievements } from '../controllers/achievementController.js';
import { optionalAuth, protect } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getAchievements);
router.get('/my', protect, getUserAchievements);

export default router;
