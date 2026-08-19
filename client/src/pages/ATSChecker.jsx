import React, { useState } from 'react';
import {
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  FileText,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ATSChecker = () => {
  const { fetchProfile } = useAuth();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('MERN Stack Developer');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!resumeFile) {
      setErrorMessage('Please upload your resume PDF file first.');
      return;
    }
    if (!jobTitle.trim()) {
      setErrorMessage('Please enter your Target Job Title.');
      return;
    }

    const formData = new FormData();
    formData.append('resumeFile', resumeFile);
    formData.append('jobTitle', jobTitle);

    setLoading(true);
    try {
      const res = await api.post('/ats/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setReport(res.data);
        if (res.data.usedDemo) {
          setInfoMessage('ATS Demo Score generated for testing (60 - 89 range).');
        } else if (res.data.usedOCR) {
          setInfoMessage('Analyzed using AI Vision OCR scan for image-based/scanned PDF.');
        }
        await fetchProfile(); // Update dashboard in real-time
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'We could not extract text from this resume. Please try another PDF.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="border-b border-[#e6eeff] pb-4">
        <h1 className="text-2xl font-extrabold text-[#121c2a] flex items-center gap-2">
          <FileCheck2 className="w-7 h-7 text-[#4648d4]" /> ATS Resume Compatibility Checker
        </h1>
        <p className="text-xs text-[#767586] mt-1">
          Upload your resume PDF (text or scanned) and enter your target position to run an AI recruiter audit.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2 font-semibold shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs flex items-center gap-2 font-semibold shadow-sm">
          <Info className="w-4 h-4 shrink-0 text-blue-600" />
          <span>{infoMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Job Title Form Panel */}
        <div className="space-y-6">
          <Card title="1. Upload Resume PDF">
            <div className="space-y-4">
              <label className="border-2 border-dashed border-[#c7c4d7] hover:border-[#4648d4] bg-[#f8f9ff] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-[#4648d4]" />
                <div className="space-y-1">
                  <span className="text-sm font-bold text-[#121c2a] block">
                    {resumeFile ? resumeFile.name : 'Click to Upload Resume (PDF)'}
                  </span>
                  <span className="text-xs text-[#767586] block">Supports text & scanned .pdf documents up to 10MB</span>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    setErrorMessage('');
                    setInfoMessage('');
                    setResumeFile(e.target.files[0]);
                  }}
                />
              </label>

              {resumeFile && (
                <div className="p-3 bg-[#e6eeff]/60 rounded-xl border border-[#4648d4]/30 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#4648d4]" />
                  <div className="flex-1 truncate text-xs font-semibold text-[#121c2a]">{resumeFile.name}</div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Ready
                  </span>
                </div>
              )}
            </div>
          </Card>

          {resumeFile && (
            <Card title="2. Target Job Title & Audit">
              <form onSubmit={handleAnalyze} className="space-y-4">
                <Input
                  label="Target Job Title"
                  placeholder="e.g. MERN Stack Developer / SDE 1 / Java Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />

                <Button variant="primary" size="lg" className="w-full" type="submit" loading={loading}>
                  <Sparkles className="w-5 h-5 mr-2" /> Check ATS Score
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Audit Results Panel */}
        <div>
          {report ? (
            <div className="space-y-6">
              <Card className="text-center space-y-3 relative overflow-hidden">
                {report.usedDemo && (
                  <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                    DEMO SCORE
                  </span>
                )}
                <div className="w-14 h-14 bg-[#e6eeff] text-[#4648d4] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#121c2a]">
                    {report.usedDemo ? 'ATS Demo Score' : 'ATS Compatibility Score'}
                  </h3>
                  <p className="text-xs text-[#767586] mt-0.5">Target Position: <strong>{report.jobTitle || jobTitle}</strong></p>
                </div>
                <div className="inline-block bg-[#4648d4] text-white px-6 py-2.5 rounded-xl font-extrabold text-3xl shadow-sm">
                  {report.score} / 100
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
                  <div className="p-2.5 bg-[#f8f9ff] rounded-lg border border-[#e6eeff]">
                    <span className="text-[#767586] block text-[11px]">Keyword Match</span>
                    <div className="font-bold text-[#4648d4] text-base mt-0.5">{report.keywordMatch || report.categoryScores?.keywordMatch}%</div>
                  </div>
                  <div className="p-2.5 bg-[#f8f9ff] rounded-lg border border-[#e6eeff]">
                    <span className="text-[#767586] block text-[11px]">Skills Match</span>
                    <div className="font-bold text-[#4648d4] text-base mt-0.5">{report.skillsMatch || report.categoryScores?.skillMatch}%</div>
                  </div>
                </div>
              </Card>

              {/* Matched vs Missing Keywords */}
              <div className="grid grid-cols-2 gap-4">
                <Card title="Matched Skills">
                  <ul className="space-y-1.5 text-xs">
                    {(report.matchedKeywords || []).map((k, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {k}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Missing Skills">
                  <ul className="space-y-1.5 text-xs">
                    {(report.missingKeywords || []).map((k, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[#ba1a1a] font-medium">
                        <XCircle className="w-3.5 h-3.5 shrink-0" /> {k}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Suggestions */}
              <Card title="Actionable Improvements">
                <ul className="space-y-2 text-xs text-[#121c2a]">
                  {(report.suggestions || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#4648d4] shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : (
            <div className="bg-white border border-[#e6eeff] rounded-xl p-12 text-center space-y-3 shadow-sm">
              <FileCheck2 className="w-12 h-12 text-[#c7c4d7] mx-auto" />
              <h3 className="font-bold text-[#121c2a]">No ATS Audit Performed Yet</h3>
              <p className="text-xs text-[#767586] max-w-xs mx-auto">
                Upload your resume PDF on the left and enter your target job title to generate a real-time recruiter audit score.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-xs text-[#767586]">Developed by Amareswar Nayak</p>
      </div>
    </div>
  );
};
