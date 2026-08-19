import express from 'express';
import { startInterview, submitAnswer, getInterview, getInterviewHistory } from '../controllers/interviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateUser, startInterview);
router.post('/:id/answer', authenticateUser, submitAnswer);
router.get('/history', authenticateUser, getInterviewHistory);
router.get('/:id', authenticateUser, getInterview);

export default router;
