import { Router } from 'express';
import { getGlobalLeaderboard, getWeeklyLeaderboard, getMyRank } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/global', getGlobalLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/my-rank', protect, getMyRank);

export default router;
