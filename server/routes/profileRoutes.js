import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateUser, getProfile);
router.put('/', authenticateUser, updateProfile);

export default router;
