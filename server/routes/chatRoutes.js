import express from 'express';
import { sendChatMessage, getChatHistory, getConversation, deleteConversation } from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateUser, sendChatMessage);
router.get('/history', authenticateUser, getChatHistory);
router.get('/:id', authenticateUser, getConversation);
router.delete('/:id', authenticateUser, deleteConversation);

export default router;
