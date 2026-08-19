import pdfParse from 'pdf-parse';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { generateEmbedding, generateGeminiContent } from './geminiService.js';

// Cosine similarity calculation helper
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Simple TF-IDF / Keyword overlap fallback score
const keywordScore = (query, text) => {
  const qWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  if (qWords.length === 0) return 0;
  const tLower = text.toLowerCase();
  let matches = 0;
  for (const word of qWords) {
    if (tLower.includes(word)) matches++;
  }
  return matches / qWords.length;
};

export const processPDFDocument = async (userId, fileName, fileBuffer) => {
  const doc = await Document.create({
    userId,
    fileName,
    fileSize: fileBuffer.length,
    status: 'processing',
  });

  try {
    const pdfData = await pdfParse(fileBuffer);
    const fullText = pdfData.text || '';

    if (!fullText.trim()) {
      throw new Error('PDF document text extraction returned empty content. Make sure PDF contains selectable text.');
    }

    // Split text into overlapping chunks
    const chunkSize = 500;
    const overlap = 100;
    const chunks = [];
    let start = 0;
    let pageNum = 1;

    while (start < fullText.length) {
      const end = Math.min(start + chunkSize, fullText.length);
      const chunkText = fullText.slice(start, end).trim();

      if (chunkText.length > 20) {
        chunks.push({
          text: chunkText,
          pageNumber: Math.min(pageNum, pdfData.numpages || 1),
          chunkIndex: chunks.length,
        });
      }

      start += chunkSize - overlap;
      if (chunks.length % 5 === 0 && pageNum < (pdfData.numpages || 1)) {
        pageNum++;
      }
    }

    // Generate embeddings for chunks
    for (let i = 0; i < chunks.length; i++) {
      let embedding = [];
      try {
        embedding = await generateEmbedding(chunks[i].text);
      } catch (e) {
        console.warn(`[Embedding Chunk ${i} Warning]:`, e.message);
      }

      await DocumentChunk.create({
        documentId: doc._id,
        userId,
        text: chunks[i].text,
        embedding,
        pageNumber: chunks[i].pageNumber,
        chunkIndex: chunks[i].chunkIndex,
      });
    }

    doc.status = 'ready';
    doc.chunkCount = chunks.length;
    await doc.save();

    return doc;
  } catch (error) {
    console.error('[RAG Processing Error]:', error.message);
    doc.status = 'failed';
    await doc.save();
    throw error;
  }
};

export const queryPDFDocument = async (userId, documentId, query) => {
  const doc = await Document.findOne({ _id: documentId, userId });
  if (!doc) {
    throw new Error('Document not found or access denied');
  }

  let queryEmbedding = [];
  try {
    queryEmbedding = await generateEmbedding(query);
  } catch (e) {
    console.warn('[Query Embedding Warning]:', e.message);
  }

  const chunks = await DocumentChunk.find({ documentId, userId });

  if (!chunks || chunks.length === 0) {
    return {
      answer: "The uploaded document does not contain enough information to answer this question.",
      sources: [],
    };
  }

  // Score chunks combining cosine similarity & keyword match
  const scoredChunks = chunks.map((c) => {
    const cosSim = queryEmbedding.length > 0 ? cosineSimilarity(queryEmbedding, c.embedding) : 0;
    const kwSim = keywordScore(query, c.text);
    const combinedScore = (cosSim * 0.7) + (kwSim * 0.3);
    return { chunk: c, score: combinedScore };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.slice(0, 4);

  const contextText = topChunks
    .map((item, index) => `[Source ${index + 1} - Page ${item.chunk.pageNumber}]: ${item.chunk.text}`)
    .join('\n\n');

  const systemPrompt = `
You are a precise PDF Document AI assistant for CareerAI.
Answer the user's question STRICTLY based on the provided context retrieved from the document "${doc.fileName}".
If the context does not contain enough information to answer the question, state:
"The uploaded document does not contain enough information to answer this question."

Always cite the relevant source page numbers in your answer.
`;

  const prompt = `Context from document:\n${contextText}\n\nUser Question: ${query}`;
  const aiAnswer = await generateGeminiContent(prompt, systemPrompt);

  return {
    answer: aiAnswer,
    sources: topChunks.map((item) => ({
      pageNumber: item.chunk.pageNumber,
      textSnippet: item.chunk.text.substring(0, 150) + '...',
      score: item.score,
    })),
  };
};
