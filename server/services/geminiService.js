import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAIInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini Service Error] GEMINI_API_KEY is not defined in environment');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateGeminiContent = async (prompt, systemInstruction = '') => {
  const genAI = getGenAIInstance();
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }

  // Model preference list with gemini-2.5-flash first
  const models = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-1.5-flash'];

  for (const modelName of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const modelOptions = { model: modelName };
        if (systemInstruction) {
          modelOptions.systemInstruction = systemInstruction;
        }

        const model = genAI.getGenerativeModel(modelOptions);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text) {
          console.log(`[Gemini Service Success] Responded using model: ${modelName}`);
          return text;
        }
      } catch (err) {
        console.warn(`[Gemini ${modelName} (Attempt ${attempt}) Warning]:`, err.message);
        if (err.message.includes('429') || err.message.includes('Quota exceeded') || err.message.includes('503')) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
          continue;
        }
        break;
      }
    }
  }

  throw new Error('Gemini API free tier daily quota temporarily reached. Operating with smart fallback.');
};

// Gemini AI Vision OCR Fallback for scanned/image PDF resumes
export const analyzePDFWithGeminiVision = async (pdfBuffer, jobTitle, jobDescription = '') => {
  const genAI = getGenAIInstance();
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }

  console.log('[ATS OCR Fallback] Initiating Gemini AI Vision PDF scanning & OCR text extraction');

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  const base64Data = pdfBuffer.toString('base64');
  const pdfPart = {
    inlineData: {
      data: base64Data,
      mimeType: 'application/pdf',
    },
  };

  const prompt = `
You are an expert Applicant Tracking System (ATS) auditor and hiring manager.
Read and analyze the attached PDF resume document (scanned or image pages) against the Target Position: "${jobTitle}".
Job Details: "${jobDescription.substring(0, 2000)}"

Perform full OCR text extraction on the resume, then evaluate ATS compatibility score.
Return JSON format ONLY:
{
  "score": 82,
  "keywordMatch": 80,
  "skillsMatch": 84,
  "experienceMatch": 78,
  "formattingScore": 88,
  "matchedKeywords": ["JavaScript", "React", "Node.js", "Problem Solving"],
  "missingKeywords": ["Docker", "AWS Cloud", "CI/CD"],
  "suggestions": ["Add measurable metrics to project bullets", "Highlight cloud engineering skills"]
}
`;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, pdfPart]);
      const response = await result.response;
      const text = response.text();
      if (text) {
        console.log(`[ATS OCR Success] Gemini AI Vision extracted & audited PDF using ${modelName}`);
        return text;
      }
    } catch (err) {
      console.warn(`[Gemini Vision ${modelName} Error]:`, err.message);
    }
  }

  throw new Error('AI Vision OCR extraction failed for PDF document.');
};

export const generateEmbedding = async (text) => {
  try {
    const genAI = getGenAIInstance();
    if (!genAI) return new Array(768).fill(0.01);

    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.warn('[Gemini Embedding Warning]:', error.message);
    return new Array(768).fill(0.01);
  }
};
