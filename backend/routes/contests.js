import { Router } from 'express';
import { getContests, getContest, joinContest, createContest, updateContest, deleteContest, getContestLeaderboard } from '../controllers/contestController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getContests);
router.get('/:idOrSlug', optionalAuth, getContest);
router.post('/:id/join', protect, joinContest);
router.get('/:id/leaderboard', getContestLeaderboard);
router.post('/', protect, adminOnly, createContest);
router.put('/:id', protect, adminOnly, updateContest);
router.delete('/:id', protect, adminOnly, deleteContest);

export default router;
