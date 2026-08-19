import express from 'express';
import { createOrUpdateResume, getResumes, getResume, deleteResume, enhanceContent } from '../controllers/resumeController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateUser, createOrUpdateResume);
router.get('/', authenticateUser, getResumes);
router.get('/:id', authenticateUser, getResume);
router.delete('/:id', authenticateUser, deleteResume);
router.post('/enhance', authenticateUser, enhanceContent);

export default router;
