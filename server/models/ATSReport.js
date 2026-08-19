import mongoose from 'mongoose';

const atsReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeTitle: { type: String, default: 'Uploaded Resume' },
    jobDescription: { type: String, required: true },
    jobTitle: { type: String, default: 'Target Role' },
    score: { type: Number, required: true },
    categoryScores: {
      keywordMatch: Number,
      skillMatch: Number,
      experienceRelevance: Number,
      formatting: Number,
    },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    suggestions: [{ type: String }],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
  },
  { timestamps: true }
);

export const ATSReport = mongoose.model('ATSReport', atsReportSchema);
