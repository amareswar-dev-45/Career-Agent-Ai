import { Resume } from '../models/Resume.js';
import { generateGeminiContent } from '../services/geminiService.js';

export const createOrUpdateResume = async (req, res) => {
  try {
    const { id, title, template, personalInfo, summary, education, experience, skills, projects, certifications, achievements } = req.body;

    let resume;
    if (id) {
      resume = await Resume.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { title, template, personalInfo, summary, education, experience, skills, projects, certifications, achievements },
        { new: true }
      );
    }

    if (!resume) {
      resume = await Resume.create({
        userId: req.user._id,
        title: title || 'Software Engineer Resume',
        template: template || 'modern',
        personalInfo,
        summary,
        education,
        experience,
        skills,
        projects,
        certifications,
        achievements,
      });
    }

    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error('[Resume Save Error]:', error.stack || error.message);
    return res.status(500).json({ success: false, message: 'Failed to save resume', error: error.message });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resumes', error: error.message });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resume', error: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    return res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete resume', error: error.message });
  }
};

export const enhanceContent = async (req, res) => {
  try {
    const { type, content, role } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content to enhance is required' });
    }

    const systemPrompt = `
You are an expert resume writer and recruiter for top tech companies.
Rewrite and optimize the following resume ${type || 'content'} to be action-oriented, professional, and impact-driven with quantitative metrics where applicable.
Target Role: ${role || 'Software Engineer'}.
Return ONLY the enhanced output text without surrounding preamble or quotes.
`;

    let enhancedText = content;
    try {
      enhancedText = await generateGeminiContent(`Rewrite: "${content}"`, systemPrompt);
    } catch (e) {
      console.warn('[Resume AI Enhance Fallback]:', e.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        original: content,
        enhanced: enhancedText.trim(),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'AI resume enhancement failed', error: error.message });
  }
};
