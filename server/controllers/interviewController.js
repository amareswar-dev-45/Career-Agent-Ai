import { Interview } from '../models/Interview.js';
import { generateGeminiContent } from '../services/geminiService.js';

// Normalize category names
const normalizeCategory = (cat) => {
  if (!cat) return 'Technical';
  const lower = cat.toLowerCase();
  if (lower.includes('hr')) return 'HR';
  if (lower.includes('aptitude')) return 'Aptitude';
  if (lower.includes('reasoning') || lower.includes('logical')) return 'Reasoning';
  if (lower.includes('behavioral')) return 'Behavioral';
  return 'Technical';
};

// Normalize difficulty names
const normalizeDifficulty = (diff) => {
  if (!diff) return 'Medium';
  const lower = diff.toLowerCase();
  if (lower.includes('easy')) return 'Easy';
  if (lower.includes('hard')) return 'Hard';
  if (lower.includes('adaptive')) return 'Adaptive';
  return 'Medium';
};

// Domain fallback question generator
const getFallbackQuestion = (category, topic, difficulty) => {
  const cat = normalizeCategory(category);
  const diff = normalizeDifficulty(difficulty);

  const fallbackBank = {
    Technical: {
      Easy: `What are the core principles of ${topic}, and how do you use them in basic applications?`,
      Medium: `Can you explain the difference between state management and props in ${topic}, along with common performance optimization techniques?`,
      Hard: `How would you architect a high-throughput microservice using ${topic}, addressing concurrency, error handling, and scalability?`,
    },
    HR: {
      Easy: `Tell me about yourself, your academic background, and what motivated you to pursue a career in technology.`,
      Medium: `What are your top 3 professional strengths and 1 technical area you are actively working to improve?`,
      Hard: `Where do you see yourself in 5 years, and how does this position align with your long-term career aspirations?`,
    },
    Aptitude: {
      Easy: `If a car travels at a speed of 60 km/h for 2.5 hours, calculate the total distance covered.`,
      Medium: `A train running at 72 km/h crosses a 250m long platform in 20 seconds. What is the length of the train?`,
      Hard: `In a group of 100 students, 60 study CS, 40 study Math, and 20 study both. What is the probability that a randomly chosen student studies neither?`,
    },
    Reasoning: {
      Easy: `If all A are B, and all B are C, can we logically conclude that all A are C? Explain your reasoning.`,
      Medium: `In a seating arrangement of 6 people around a circular table, if X sits opposite Y, determine the position of Z relative to X.`,
      Hard: `Complete the pattern sequence: 2, 6, 12, 20, 30, ?. State the mathematical logic behind your answer.`,
    },
    Behavioral: {
      Easy: `Describe a situation where you had to learn a new programming technology quickly to complete a deadline.`,
      Medium: `Tell me about a time when you experienced a disagreement within your project team. How did you resolve it?`,
      Hard: `Describe a significant project failure or setback you experienced. What root cause did you identify and what would you do differently?`,
    },
  };

  return fallbackBank[cat]?.[diff] || `Can you explain the key concepts of ${topic} and how you approach problem-solving in this area?`;
};

export const startInterview = async (req, res) => {
  try {
    const { type, category, topic, difficulty } = req.body;
    const categoryName = normalizeCategory(type || category);
    const selectedTopic = topic || 'Core Fundamentals';
    const selectedDifficulty = normalizeDifficulty(difficulty);

    let questionText = getFallbackQuestion(categoryName, selectedTopic, selectedDifficulty);

    try {
      const systemPrompt = `
You are an expert ${categoryName} Interviewer for college placements.
Generate 1 clear, professional interview question for a candidate on "${selectedTopic}" at a "${selectedDifficulty}" level.
Return JSON with key: "question".
`;
      const rawResponse = await generateGeminiContent(`Generate question for ${selectedTopic}`, systemPrompt);
      const parsed = JSON.parse(rawResponse.replace(/```json|```/g, '').trim());
      if (parsed.question) questionText = parsed.question;
    } catch (e) {
      console.warn('[Start Interview Gemini Warning - Using Fallback Question]:', e.message);
    }

    const interview = await Interview.create({
      userId: req.user._id,
      type: categoryName,
      topic: selectedTopic,
      difficulty: selectedDifficulty,
      questions: [
        {
          question: questionText,
        },
      ],
      startedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      sessionId: interview._id,
      interviewId: interview._id,
      questionNumber: 1,
      questionIndex: 0,
      totalQuestions: 5,
      question: questionText,
      currentQuestion: questionText,
      data: {
        interviewId: interview._id,
        questionIndex: 0,
        totalQuestions: 5,
        currentQuestion: questionText,
      },
    });
  } catch (error) {
    console.error('[Start Interview Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'Failed to start interview session', error: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const interview = await Interview.findOne({ _id: id, userId: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const currentIndex = interview.questions.length - 1;
    const currentQ = interview.questions[currentIndex];
    currentQ.answer = answer || 'No answer provided.';

    let evalScore = 75;
    let evalText = 'Good effort in addressing the question core concepts.';
    let evalFeedback = 'Include specific technical examples or quantitative metrics.';

    try {
      const evalSystemPrompt = `
You are an expert interviewer evaluating a candidate's response.
Question: "${currentQ.question}"
Candidate Answer: "${currentQ.answer}"

Output JSON:
{
  "score": <number 0-100>,
  "evaluation": "<2 sentence summary>",
  "feedback": "<1 actionable tip>"
}
`;
      const rawEval = await generateGeminiContent('Evaluate answer', evalSystemPrompt);
      const parsed = JSON.parse(rawEval.replace(/```json|```/g, '').trim());
      if (typeof parsed.score === 'number') evalScore = parsed.score;
      if (parsed.evaluation) evalText = parsed.evaluation;
      if (parsed.feedback) evalFeedback = parsed.feedback;
    } catch (e) {
      console.warn('[Submit Answer Gemini Warning - Using Fallback Eval]:', e.message);
    }

    currentQ.score = evalScore;
    currentQ.evaluation = evalText;
    currentQ.feedback = evalFeedback;

    // Check if 5 questions completed
    if (interview.questions.length >= 5) {
      interview.status = 'completed';
      interview.completedAt = new Date();

      const totalScore = interview.questions.reduce((acc, q) => acc + (q.score || 0), 0);
      interview.overallScore = Math.round(totalScore / interview.questions.length);

      interview.categoryScores = {
        technicalKnowledge: interview.overallScore,
        problemSolving: interview.overallScore,
        communication: Math.min(100, interview.overallScore + 5),
        confidence: Math.min(100, interview.overallScore + 2),
        behavioralQuality: Math.min(100, interview.overallScore - 2),
      };
      interview.strengths = ['Clear fundamental understanding', 'Structured communication style'];
      interview.weaknesses = ['Could elaborate further on edge case handling'];
      interview.recommendations = ['Practice timing and deep technical details'];

      try {
        const reportPrompt = `
Generate summary report for candidate completing a 5-question ${interview.type} interview on ${interview.topic}.
Output JSON:
{
  "categoryScores": { "technicalKnowledge": 80, "problemSolving": 78, "communication": 82, "confidence": 80, "behavioralQuality": 76 },
  "strengths": ["<s1>", "<s2>"],
  "weaknesses": ["<w1>", "<w2>"],
  "recommendations": ["<r1>", "<r2>"]
}
`;
        const rawReport = await generateGeminiContent('Final report', reportPrompt);
        const parsedReport = JSON.parse(rawReport.replace(/```json|```/g, '').trim());
        if (parsedReport.categoryScores) interview.categoryScores = parsedReport.categoryScores;
        if (parsedReport.strengths) interview.strengths = parsedReport.strengths;
        if (parsedReport.weaknesses) interview.weaknesses = parsedReport.weaknesses;
        if (parsedReport.recommendations) interview.recommendations = parsedReport.recommendations;
      } catch (e) {
        console.warn('[Final Report Gemini Warning]:', e.message);
      }

      await interview.save();

      return res.status(200).json({
        success: true,
        isCompleted: true,
        data: interview,
      });
    }

    // Next Question
    let nextQuestionText = getFallbackQuestion(interview.type, interview.topic, interview.difficulty);
    try {
      const nextQPrompt = `
Generate Question ${interview.questions.length + 1} of 5 for a ${interview.type} interview on "${interview.topic}".
Previous questions: ${interview.questions.map((q) => `"${q.question}"`).join('; ')}
Return JSON: {"question": "<next question text>"}
`;
      const rawNextQ = await generateGeminiContent('Generate next question', nextQPrompt);
      const parsedNext = JSON.parse(rawNextQ.replace(/```json|```/g, '').trim());
      if (parsedNext.question) nextQuestionText = parsedNext.question;
    } catch (e) {
      console.warn('[Next Question Gemini Warning]:', e.message);
    }

    interview.questions.push({
      question: nextQuestionText,
    });

    await interview.save();

    return res.status(200).json({
      success: true,
      isCompleted: false,
      data: {
        questionIndex: interview.questions.length - 1,
        totalQuestions: 5,
        currentQuestion: nextQuestionText,
        lastEvaluation: {
          score: evalScore,
          evaluation: evalText,
          feedback: evalFeedback,
        },
      },
    });
  } catch (error) {
    console.error('[Submit Answer Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'Failed to process answer evaluation', error: error.message });
  }
};

export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }
    return res.status(200).json({ success: true, data: interview });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch interview details', error: error.message });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .select('type topic difficulty status overallScore startedAt completedAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: interviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch interview history', error: error.message });
  }
};
