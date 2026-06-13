import { Router } from 'express';
import { getAIHint, getAIErrorExplanation, getAIProblemExplanation, getAIOptimization } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/hint', protect, getAIHint);
router.post('/explain-error', protect, getAIErrorExplanation);
router.post('/explain-problem', protect, getAIProblemExplanation);
router.post('/optimize', protect, getAIOptimization);

export default router;
