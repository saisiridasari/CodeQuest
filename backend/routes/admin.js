import { Router } from 'express';
import {
  getStats, getUsers, getUser, updateUser, deleteUser,
  getAllProblems, createProblem, updateProblem, deleteProblem,
  getAllContests, createContest, updateContest, deleteContest,
  getAnalytics,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Problems
router.get('/problems', getAllProblems);
router.post('/problems', createProblem);
router.put('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);

// Contests
router.get('/contests', getAllContests);
router.post('/contests', createContest);
router.put('/contests/:id', updateContest);
router.delete('/contests/:id', deleteContest);

export default router;
