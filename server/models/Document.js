import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, default: '' },
    mimeType: { type: String, default: 'application/pdf' },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
    chunkCount: { type: Number, default: 0 },
    fileSize: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
