import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  evaluation: { type: String, default: '' },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  askedAt: { type: Date, default: Date.now }
});

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, default: 'Medium' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    questions: [questionSchema],
    overallScore: { type: Number, default: 0 },
    categoryScores: {
      technicalKnowledge: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      behavioralQuality: { type: Number, default: 0 },
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Interview = mongoose.model('Interview', interviewSchema);
