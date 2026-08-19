import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true },
    embedding: [{ type: Number }],
    pageNumber: { type: Number, default: 1 },
    chunkIndex: { type: Number, default: 0 },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

export const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);
