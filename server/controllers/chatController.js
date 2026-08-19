import { Conversation } from '../models/Conversation.js';
import { generateGeminiContent } from '../services/geminiService.js';

export const sendChatMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
    }

    if (!conversation) {
      const titleSnippet = message.substring(0, 30) + (message.length > 30 ? '...' : '');
      conversation = await Conversation.create({
        userId: req.user._id,
        title: titleSnippet,
        messages: [],
      });
    }

    // Save user message
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Build context
    const recentMessages = conversation.messages.slice(-8);
    const contextPrompt = recentMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const systemInstruction = `
You are CareerAI Assistant, an expert placement mentor for college students and software job seekers.
Provide structured, professional advice on CS concepts, interview strategies, DBMS, React, Node.js, and resume tips.
Format code snippets using markdown block quotes (\`\`\`language ... \`\`\`).
`;

    let aiResponseText = '';
    try {
      aiResponseText = await generateGeminiContent(contextPrompt, systemInstruction);
    } catch (e) {
      console.warn('[Chat Gemini Fallback]:', e.message);
      aiResponseText = `Welcome to CareerAI! Regarding your query on "${message.substring(0, 40)}": As a software candidate, focus on demonstrating strong problem-solving, structured algorithms, and clear communication. Let me know if you would like to practice technical interview questions or optimize your resume for ATS screening!`;
    }

    // Save assistant response
    conversation.messages.push({ role: 'assistant', content: aiResponseText, timestamp: new Date() });
    await conversation.save();

    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        title: conversation.title,
        message: conversation.messages[conversation.messages.length - 1],
      },
    });
  } catch (error) {
    console.error('[Chat Controller Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'AI chat response failed', error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    return res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch conversation details', error: error.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    return res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete conversation', error: error.message });
  }
};
