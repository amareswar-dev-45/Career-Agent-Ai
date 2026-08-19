import { Document } from '../models/Document.js';
import { processPDFDocument, queryPDFDocument } from '../services/ragService.js';

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    if (req.file.mimetype !== 'application/pdf' && !req.file.originalname.endsWith('.pdf')) {
      return res.status(400).json({ success: false, message: 'Only PDF files are supported' });
    }

    const doc = await processPDFDocument(req.user._id, req.file.originalname, req.file.buffer);

    return res.status(201).json({
      success: true,
      message: 'PDF uploaded and processed successfully',
      documentId: doc._id,
      fileName: doc.fileName,
      status: doc.status,
      data: doc,
    });
  } catch (error) {
    console.error('[Document Upload Controller Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'PDF upload/processing failed: ' + error.message, error: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
  }
};

export const getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch document', error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    await Document.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    return res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
  }
};

export const chatWithDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Question/message is required' });
    }

    const result = await queryPDFDocument(req.user._id, id, message);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Document Chat Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'Document Q&A query failed: ' + error.message, error: error.message });
  }
};
