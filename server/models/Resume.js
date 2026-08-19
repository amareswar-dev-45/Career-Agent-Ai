import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, default: 'My Resume' },
    template: { type: String, default: 'modern' },
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedIn: String,
      github: String,
      portfolio: String,
    },
    summary: { type: String, default: '' },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: String,
        endDate: String,
        gpa: String,
        description: String,
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        location: String,
        startDate: String,
        endDate: String,
        description: String,
        highlights: [String],
      },
    ],
    skills: [{ type: String }],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        projectUrl: String,
        githubUrl: String,
        link: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: String,
        credentialId: String,
        credentialUrl: String,
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        date: String,
      },
    ],
  },
  { timestamps: true }
);

export const Resume = mongoose.model('Resume', resumeSchema);
