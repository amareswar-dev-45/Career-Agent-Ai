import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    bio: { type: String, default: '' },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: String,
        endYear: String,
        grade: String,
      },
    ],
    skills: [{ type: String }],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
    experience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: String,
        credentialUrl: String,
      },
    ],
    achievements: [{ type: String }],
    targetRoles: [{ type: String }],
  },
  { timestamps: true }
);

export const Profile = mongoose.model('Profile', profileSchema);
