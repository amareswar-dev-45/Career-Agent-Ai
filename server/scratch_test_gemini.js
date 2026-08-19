import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini36() {
  try {
    console.log("Testing gemini-3.6-flash...");
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const res = await model.generateContent("Hello, reply with a short friendly greeting!");
    console.log("SUCCESS RESPONSE:", await res.response.text());
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

testGemini36();
