import express from 'express';
import multer from 'multer';
import { analyzeATS, getATSHistory } from '../controllers/atsController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.post('/analyze', authenticateUser, upload.single('resumeFile'), analyzeATS);
router.get('/history', authenticateUser, getATSHistory);

export default router;
