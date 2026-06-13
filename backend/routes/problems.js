import { Router } from 'express';
import { getProblems, getProblem, createProblem, updateProblem, deleteProblem, getRandomProblem } from '../controllers/problemController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import { validateProblem } from '../middleware/validate.js';

const router = Router();

router.get('/', optionalAuth, getProblems);
router.get('/random', getRandomProblem);
router.get('/:idOrSlug', optionalAuth, getProblem);
router.post('/', protect, adminOnly, validateProblem, createProblem);
router.put('/:id', protect, adminOnly, updateProblem);
router.delete('/:id', protect, adminOnly, deleteProblem);

export default router;
