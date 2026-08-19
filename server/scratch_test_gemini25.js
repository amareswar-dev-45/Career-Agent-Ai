import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", apiKey);

// Test via SDK
async function testSDK() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const res = await model.generateContent("Hello");
    console.log("SDK gemini-2.5-flash SUCCESS:", await res.response.text());
  } catch (err) {
    console.log("SDK gemini-2.5-flash Error:", err.message);
  }
}

// Test via v1beta REST API directly
async function testREST() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    console.log("REST gemini-2.5-flash SUCCESS:", res.data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.log("REST gemini-2.5-flash Error:", err.response?.data?.error?.message || err.message);
  }
}

async function run() {
  await testSDK();
  await testREST();
}

run();
