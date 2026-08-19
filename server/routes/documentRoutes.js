import express from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, getDocument, deleteDocument, chatWithDocument } from '../controllers/documentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

const router = express.Router();

router.post('/upload', authenticateUser, upload.single('file'), uploadDocument);
router.get('/', authenticateUser, getDocuments);
router.get('/:id', authenticateUser, getDocument);
router.delete('/:id', authenticateUser, deleteDocument);
router.post('/:id/chat', authenticateUser, chatWithDocument);

export default router;
