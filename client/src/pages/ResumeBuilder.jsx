import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Download,
  Plus,
  Trash2,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Globe,
  Trophy,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input, TextArea } from '../components/Input';
import api from '../services/api';

export const ResumeBuilder = () => {
  const [resumes, setResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);

  const [formData, setFormData] = useState({
    title: 'Software Engineer Resume',
    template: 'modern',
    personalInfo: {
      fullName: 'Alex Johnson',
      email: 'alex.johnson@university.edu',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      linkedIn: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson',
      portfolio: 'alexjohnson.dev',
    },
    summary: 'Driven Computer Science graduate with hands-on experience building scalable web applications using React, Node.js, and MongoDB.',
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Git', 'Tailwind CSS', 'Python'],
    education: [
      {
        institution: 'State University of Technology',
        degree: 'B.S. in Computer Science',
        fieldOfStudy: 'Software Engineering',
        startDate: '2022',
        endDate: '2026',
        gpa: '3.8 / 4.0',
        description: 'Relevant Coursework: Data Structures, Algorithms, Operating Systems, Database Systems.',
      },
    ],
    experience: [
      {
        company: 'Tech Innovators Inc.',
        position: 'Software Engineering Intern',
        location: 'Remote',
        startDate: 'May 2025',
        endDate: 'Aug 2025',
        description: 'Engineered REST API endpoints and optimized MongoDB queries reducing latency by 35%.',
        highlights: ['Built responsive frontend components using React and Tailwind CSS.'],
      },
    ],
    projects: [
      {
        name: 'CareerAI Student Hub',
        description: 'AI-powered career prep platform featuring adaptive interview simulator and PDF RAG learning.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Gemini AI'],
        projectUrl: 'https://careerai.app',
        githubUrl: 'github.com/alexjohnson/careerai',
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: '2025',
        credentialId: 'AWS-12345',
        credentialUrl: 'aws.amazon.com/verify/AWS-12345',
      },
    ],
    achievements: [
      {
        title: '1st Place Winner — University Hackathon 2025',
        description: 'Developed an automated AI placement prep system out of 50 student teams.',
        date: 'Nov 2025',
      },
    ],
  });

  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load resumes:', err);
    }
  };

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      const res = await api.post('/resumes', {
        id: activeResumeId,
        ...formData,
      });

      if (res.data.success) {
        setActiveResumeId(res.data.data._id);
        fetchResumes();
        alert('Resume saved successfully in MongoDB!');
      }
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAIEnhanceSummary = async () => {
    if (!formData.summary) return;
    setAiEnhancing(true);
    try {
      const res = await api.post('/resumes/enhance', {
        type: 'summary',
        content: formData.summary,
        role: 'Software Engineer',
      });

      if (res.data.success) {
        setFormData((prev) => ({ ...prev, summary: res.data.data.enhanced }));
      }
    } catch (err) {
      alert('AI enhancement failed: ' + err.message);
    } finally {
      setAiEnhancing(false);
    }
  };

  // Helper dynamic section mutators
  const addItem = (section, templateObj) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), templateObj],
    }));
  };

  const updateItem = (section, index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev[section] || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [section]: updated };
    });
  };

  const deleteItem = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6eeff] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#121c2a] flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#4648d4]" /> AI Resume Builder
          </h1>
          <p className="text-xs text-[#767586] mt-1">
            Build recruiter-approved resumes across all 8 core sections with real-time preview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSaveResume} loading={saving}>
            <Save className="w-4 h-4 mr-2" /> Save Resume
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form Editor Column */}
        <div className="space-y-6 print:hidden overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
          {/* Section 1: Personal Information */}
          <Card title="1. Personal Information">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={formData.personalInfo.fullName}
                onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, fullName: e.target.value } })}
              />
              <Input
                label="Email"
                value={formData.personalInfo.email}
                onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, email: e.target.value } })}
              />
              <Input
                label="Phone"
                value={formData.personalInfo.phone}
                onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, phone: e.target.value } })}
              />
              <Input
                label="Location"
                value={formData.personalInfo.location}
                onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, location: e.target.value } })}
              />
              <Input
                label="LinkedIn"
                value={formData.personalInfo.linkedIn}
                onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, linkedIn: e.target.value } })}
              />
              <Input
                label="GitHub"
                value={formData.personalInfo.github}
                onChange={(e) => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, github: e.target.value } })}
              />
            </div>
          </Card>

          {/* Section 2: Professional Summary */}
          <Card
            title="2. Professional Summary"
            action={
              <button
                type="button"
                onClick={handleAIEnhanceSummary}
                className="text-xs text-[#4648d4] font-semibold hover:underline flex items-center gap-1"
                disabled={aiEnhancing}
              >
                <Sparkles className="w-3.5 h-3.5" /> {aiEnhancing ? 'Enhancing...' : 'AI Enhance Summary'}
              </button>
            }
          >
            <TextArea
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </Card>

          {/* Section 3: Skills */}
          <Card title="3. Skills (Comma Separated)">
            <Input
              value={formData.skills.join(', ')}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map((s) => s.trim()) })}
            />
          </Card>

          {/* Section 4: Education */}
          <Card
            title="4. Education"
            action={
              <button
                type="button"
                onClick={() => addItem('education', { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: '', description: '' })}
                className="text-xs text-[#4648d4] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            }
          >
            <div className="space-y-4">
              {formData.education.map((edu, idx) => (
                <div key={idx} className="p-3 border border-[#e6eeff] rounded-lg space-y-3 relative">
                  <button
                    onClick={() => deleteItem('education', idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Institution" value={edu.institution} onChange={(e) => updateItem('education', idx, 'institution', e.target.value)} />
                    <Input label="Degree" value={edu.degree} onChange={(e) => updateItem('education', idx, 'degree', e.target.value)} />
                    <Input label="Field of Study" value={edu.fieldOfStudy} onChange={(e) => updateItem('education', idx, 'fieldOfStudy', e.target.value)} />
                    <Input label="GPA / Grade" value={edu.gpa} onChange={(e) => updateItem('education', idx, 'gpa', e.target.value)} />
                    <Input label="Start Date" value={edu.startDate} onChange={(e) => updateItem('education', idx, 'startDate', e.target.value)} />
                    <Input label="End Date" value={edu.endDate} onChange={(e) => updateItem('education', idx, 'endDate', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 5: Experience */}
          <Card
            title="5. Experience"
            action={
              <button
                type="button"
                onClick={() => addItem('experience', { company: '', position: '', location: '', startDate: '', endDate: '', description: '' })}
                className="text-xs text-[#4648d4] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            }
          >
            <div className="space-y-4">
              {formData.experience.map((exp, idx) => (
                <div key={idx} className="p-3 border border-[#e6eeff] rounded-lg space-y-3 relative">
                  <button
                    onClick={() => deleteItem('experience', idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Company" value={exp.company} onChange={(e) => updateItem('experience', idx, 'company', e.target.value)} />
                    <Input label="Position / Role" value={exp.position} onChange={(e) => updateItem('experience', idx, 'position', e.target.value)} />
                    <Input label="Start Date" value={exp.startDate} onChange={(e) => updateItem('experience', idx, 'startDate', e.target.value)} />
                    <Input label="End Date" value={exp.endDate} onChange={(e) => updateItem('experience', idx, 'endDate', e.target.value)} />
                  </div>
                  <TextArea
                    label="Description / Impact"
                    rows={2}
                    value={exp.description}
                    onChange={(e) => updateItem('experience', idx, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Section 6: Projects */}
          <Card
            title="6. Projects"
            action={
              <button
                type="button"
                onClick={() => addItem('projects', { name: '', description: '', technologies: [], projectUrl: '', githubUrl: '' })}
                className="text-xs text-[#4648d4] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            }
          >
            <div className="space-y-4">
              {formData.projects.map((proj, idx) => (
                <div key={idx} className="p-3 border border-[#e6eeff] rounded-lg space-y-3 relative">
                  <button
                    onClick={() => deleteItem('projects', idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Project Name" value={proj.name} onChange={(e) => updateItem('projects', idx, 'name', e.target.value)} />
                    <Input
                      label="Technologies (comma separated)"
                      value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                      onChange={(e) => updateItem('projects', idx, 'technologies', e.target.value.split(',').map((t) => t.trim()))}
                    />
                    <Input label="GitHub URL" value={proj.githubUrl} onChange={(e) => updateItem('projects', idx, 'githubUrl', e.target.value)} />
                    <Input label="Live Demo URL" value={proj.projectUrl} onChange={(e) => updateItem('projects', idx, 'projectUrl', e.target.value)} />
                  </div>
                  <TextArea
                    label="Project Description"
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateItem('projects', idx, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Section 7: Certifications */}
          <Card
            title="7. Certifications"
            action={
              <button
                type="button"
                onClick={() => addItem('certifications', { name: '', issuer: '', issueDate: '', credentialId: '', credentialUrl: '' })}
                className="text-xs text-[#4648d4] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            }
          >
            <div className="space-y-3">
              {formData.certifications.map((cert, idx) => (
                <div key={idx} className="p-3 border border-[#e6eeff] rounded-lg space-y-2 relative">
                  <button
                    onClick={() => deleteItem('certifications', idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Certificate Name" value={cert.name} onChange={(e) => updateItem('certifications', idx, 'name', e.target.value)} />
                    <Input label="Issuer" value={cert.issuer} onChange={(e) => updateItem('certifications', idx, 'issuer', e.target.value)} />
                    <Input label="Issue Date" value={cert.issueDate} onChange={(e) => updateItem('certifications', idx, 'issueDate', e.target.value)} />
                    <Input label="Credential URL" value={cert.credentialUrl} onChange={(e) => updateItem('certifications', idx, 'credentialUrl', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 8: Achievements */}
          <Card
            title="8. Achievements"
            action={
              <button
                type="button"
                onClick={() => addItem('achievements', { title: '', description: '', date: '' })}
                className="text-xs text-[#4648d4] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Achievement
              </button>
            }
          >
            <div className="space-y-3">
              {formData.achievements.map((ach, idx) => (
                <div key={idx} className="p-3 border border-[#e6eeff] rounded-lg space-y-2 relative">
                  <button
                    onClick={() => deleteItem('achievements', idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Title" value={ach.title} onChange={(e) => updateItem('achievements', idx, 'title', e.target.value)} />
                    <Input label="Date" value={ach.date} onChange={(e) => updateItem('achievements', idx, 'date', e.target.value)} />
                  </div>
                  <TextArea
                    label="Description"
                    rows={2}
                    value={ach.description}
                    onChange={(e) => updateItem('achievements', idx, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Preview Column (Printable Output) */}
        <div className="bg-white border border-[#e6eeff] rounded-2xl p-8 shadow-card space-y-5 print:p-0 print:border-none print:shadow-none overflow-y-auto max-h-[calc(100vh-12rem)]">
          {/* Header */}
          <div className="border-b-2 border-[#121c2a] pb-4 text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-[#121c2a] uppercase tracking-wide">
              {formData.personalInfo.fullName || 'Your Full Name'}
            </h2>
            <div className="text-xs text-[#464554] flex flex-wrap justify-center gap-3">
              {formData.personalInfo.email && <span>{formData.personalInfo.email}</span>}
              {formData.personalInfo.phone && <span>• {formData.personalInfo.phone}</span>}
              {formData.personalInfo.location && <span>• {formData.personalInfo.location}</span>}
              {formData.personalInfo.linkedIn && <span>• {formData.personalInfo.linkedIn}</span>}
              {formData.personalInfo.github && <span>• {formData.personalInfo.github}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {formData.summary && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#4648d4] uppercase tracking-wider border-b border-[#e6eeff] pb-1">
                Professional Summary
              </h3>
              <p className="text-xs text-[#121c2a] leading-relaxed">{formData.summary}</p>
            </div>
          )}

          {/* Technical Skills */}
          {formData.skills.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#4648d4] uppercase tracking-wider border-b border-[#e6eeff] pb-1">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#e6eeff] text-[#4648d4] font-semibold text-[11px] rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {formData.experience.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#4648d4] uppercase tracking-wider border-b border-[#e6eeff] pb-1">
                Professional Experience
              </h3>
              {formData.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-[#121c2a]">
                    <span>{exp.position} @ {exp.company}</span>
                    <span className="text-[#767586] font-normal">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  {exp.description && <p className="text-[#464554]">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {formData.projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#4648d4] uppercase tracking-wider border-b border-[#e6eeff] pb-1">
                Key Projects
              </h3>
              {formData.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-[#121c2a]">
                    <span>{proj.name}</span>
                    <span className="text-[#767586] font-normal">{proj.githubUrl || proj.projectUrl}</span>
                  </div>
                  <p className="text-[#464554]">{proj.description}</p>
                  {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                    <div className="text-[10px] text-[#4648d4] font-medium">
                      Tech: {proj.technologies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {formData.education.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#4648d4] uppercase tracking-wider border-b border-[#e6eeff] pb-1">
                Education
              </h3>
              {formData.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#121c2a]">{edu.institution}</div>
                    <div className="text-[#464554]">{edu.degree} — {edu.fieldOfStudy}</div>
                    {edu.description && <div className="text-[11px] text-[#767586]">{edu.description}</div>}
                  </div>
                  <div className="text-right text-[#767586]">
                    <div>{edu.startDate} – {edu.endDate}</div>
                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {formData.certifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#4648d4] uppercase tracking-wider border-b border-[#e6eeff] pb-1">
                Certifications
              </h3>
              {formData.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="font-semibold text-[#121c2a]">{cert.name} ({cert.issuer})</span>
                  <span className="text-[#767586]">{cert.issueDate}</span>
                </div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {formData.achievements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#4648d4] uppercase tracking-wider border-b border-[#e6eeff] pb-1">
                Achievements & Awards
              </h3>
              {formData.achievements.map((ach, idx) => (
                <div key={idx} className="text-xs space-y-0.5">
                  <div className="flex justify-between font-semibold text-[#121c2a]">
                    <span>{ach.title}</span>
                    <span className="text-[#767586] font-normal">{ach.date}</span>
                  </div>
                  {ach.description && <p className="text-[#464554]">{ach.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-8 print:hidden">
        <p className="text-xs text-[#767586]">Developed by Amareswar Nayak</p>
      </div>
    </div>
  );
};
