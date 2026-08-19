import dotenv from 'dotenv';
dotenv.config();

import { generateGeminiContent } from './services/geminiService.js';
import { processPDFDocument, queryPDFDocument } from './services/ragService.js';

async function testEverything() {
  console.log("==========================================");
  console.log("1. TESTING GEMINI 3.6 FLASH CHATBOT...");
  try {
    const aiText = await generateGeminiContent("Hello, state in 1 sentence your purpose as CareerAI mentor.");
    console.log("✅ GEMINI CHAT OK:", aiText.trim());
  } catch (err) {
    console.error("❌ GEMINI CHAT FAIL:", err.message);
  }

  console.log("\n==========================================");
  console.log("2. TESTING INTERVIEW GENERATION FOR ALL 5 CATEGORIES...");
  const categories = ['Technical', 'HR', 'Aptitude', 'Reasoning', 'Behavioral'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  for (const cat of categories) {
    for (const diff of difficulties) {
      try {
        const prompt = `Generate 1 ${diff} interview question for category ${cat} on topic Core Skills. Return JSON {"question": "..."}`;
        const raw = await generateGeminiContent(prompt);
        console.log(`✅ [${cat} - ${diff}] OK:`, raw.trim().substring(0, 80));
      } catch (err) {
        console.error(`❌ [${cat} - ${diff}] FAIL:`, err.message);
      }
    }
  }

  console.log("\n==========================================");
  console.log("3. TESTING ATS ANALYZER JSON...");
  try {
    const atsPrompt = `Analyze resume against JD. Output JSON: {"score": 85, "matchedKeywords": ["React"], "missingKeywords": ["Docker"], "suggestions": ["Add metrics"]}`;
    const rawAts = await generateGeminiContent(atsPrompt);
    console.log("✅ ATS JSON OK:", rawAts.trim().substring(0, 100));
  } catch (err) {
    console.error("❌ ATS FAIL:", err.message);
  }

  console.log("==========================================");
}

testEverything();
