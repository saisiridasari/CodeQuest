import { Router } from 'express';
import { submitSolution, runCode, getSubmissions, getSubmission } from '../controllers/submissionController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/submit', protect, submitSolution);
router.post('/run', protect, runCode);
router.get('/', protect, getSubmissions);
router.get('/:id', protect, getSubmission);

export default router;
