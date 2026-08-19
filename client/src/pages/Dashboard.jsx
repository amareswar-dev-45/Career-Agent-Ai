import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Video,
  MessageSquareText,
  FileText,
  FileCheck2,
  TrendingUp,
  Award,
  Flame,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { StatCard, Card } from '../components/Card';
import { Button } from '../components/Button';
import api from '../services/api';

export const Dashboard = () => {
  const { currentUser, profileData } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    interviewScore: 82,
    atsScore: 78,
    streak: 5,
    profileCompletion: 85,
  });

  const [recentInterviews, setRecentInterviews] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [intRes, chatRes, docRes] = await Promise.all([
          api.get('/interviews/history').catch(() => ({ data: { data: [] } })),
          api.get('/chat/history').catch(() => ({ data: { data: [] } })),
          api.get('/documents').catch(() => ({ data: { data: [] } })),
        ]);

        const interviews = intRes.data.data || [];
        const chats = chatRes.data.data || [];
        const docs = docRes.data.data || [];

        setRecentInterviews(interviews.slice(0, 3));
        setRecentChats(chats.slice(0, 3));
        setRecentDocuments(docs.slice(0, 3));

        if (interviews.length > 0) {
          const completed = interviews.filter((i) => i.overallScore > 0);
          if (completed.length > 0) {
            const avg = Math.round(completed.reduce((a, b) => a + b.overallScore, 0) / completed.length);
            setStats((prev) => ({ ...prev, interviewScore: avg }));
          }
        }
      } catch (err) {
        console.warn('Error loading dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  // Update ATS Score from user profile in real-time
  useEffect(() => {
    if (profileData?.user?.atsScore) {
      setStats((prev) => ({ ...prev, atsScore: profileData.user.atsScore }));
    }
  }, [profileData]);

  const userName = profileData?.user?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4648d4] to-[#6063ee] p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-yellow-300" /> Career AI Ready
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {userName}! 👋</h1>
          <p className="text-sm opacity-90 leading-relaxed">
            Your technical readiness is trending strong. We recommend practicing 10 technical DBMS & HR interview questions today to boost your overall placement confidence.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="bg-white text-[#4648d4] hover:bg-[#e6eeff] font-semibold border-none"
              onClick={() => navigate('/interviews')}
            >
              Start Placement Interview <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/chat')}
            >
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Career Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Interview Score"
          value={`${stats.interviewScore} / 100`}
          change="+8% this week"
          icon={Award}
          color="bg-[#4648d4]"
        />
        <StatCard
          title="ATS Resume Score"
          value={`${stats.atsScore} / 100`}
          change="Real-time Audit"
          icon={FileCheck2}
          color="bg-[#4b41e1]"
        />
        <StatCard
          title="Practice Streak"
          value={`${stats.streak} Days`}
          change="🔥 Keep it up!"
          icon={Flame}
          color="bg-amber-500"
        />
        <StatCard
          title="Profile Completion"
          value={`${stats.profileCompletion}%`}
          change="SDE Ready"
          icon={TrendingUp}
          color="bg-emerald-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#121c2a]">Quick Career Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => navigate('/interviews')}
            className="p-5 bg-white border border-[#e6eeff] hover:border-[#4648d4] rounded-xl transition text-left space-y-3 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e6eeff] text-[#4648d4] flex items-center justify-center group-hover:bg-[#4648d4] group-hover:text-white transition">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#121c2a]">AI Interview</div>
              <div className="text-xs text-[#767586] mt-0.5">Adaptive tech & HR prep</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="p-5 bg-white border border-[#e6eeff] hover:border-[#4648d4] rounded-xl transition text-left space-y-3 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e6eeff] text-[#4648d4] flex items-center justify-center group-hover:bg-[#4648d4] group-hover:text-white transition">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#121c2a]">AI Chatbot</div>
              <div className="text-xs text-[#767586] mt-0.5">Text & Voice mentor</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/pdf-study')}
            className="p-5 bg-white border border-[#e6eeff] hover:border-[#4648d4] rounded-xl transition text-left space-y-3 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e6eeff] text-[#4648d4] flex items-center justify-center group-hover:bg-[#4648d4] group-hover:text-white transition">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#121c2a]">PDF RAG Study</div>
              <div className="text-xs text-[#767586] mt-0.5">Q&A on notes & PDFs</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/resume-builder')}
            className="p-5 bg-white border border-[#e6eeff] hover:border-[#4648d4] rounded-xl transition text-left space-y-3 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e6eeff] text-[#4648d4] flex items-center justify-center group-hover:bg-[#4648d4] group-hover:text-white transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#121c2a]">Resume Builder</div>
              <div className="text-xs text-[#767586] mt-0.5">AI bullet optimization</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/ats-checker')}
            className="p-5 bg-white border border-[#e6eeff] hover:border-[#4648d4] rounded-xl transition text-left space-y-3 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e6eeff] text-[#4648d4] flex items-center justify-center group-hover:bg-[#4648d4] group-hover:text-white transition">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#121c2a]">ATS Checker</div>
              <div className="text-xs text-[#767586] mt-0.5">Match score & keywords</div>
            </div>
          </button>
        </div>
      </div>

      {/* Grid: AI Recommendations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Recent Activity" subtitle="Your latest preparation sessions">
            <div className="divide-y divide-[#e6eeff]">
              {recentInterviews.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#e6eeff] text-[#4648d4] flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#121c2a]">{item.topic} Interview</div>
                      <div className="text-xs text-[#767586]">{item.type} • {item.difficulty}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#4648d4]">{item.overallScore ? `${item.overallScore}/100` : 'In Progress'}</span>
                    <div className="text-[10px] text-[#767586]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {recentInterviews.length === 0 && (
                <p className="text-xs text-[#767586] py-4 text-center">No recent interviews completed yet. Start your first session!</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="AI Recommendations" subtitle="Personalized daily focus">
            <div className="space-y-3">
              <div className="p-3 bg-[#e6eeff]/60 border border-[#c7c4d7]/40 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-[#4648d4] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4648d4]" /> HR Communication Focus
                </div>
                <p className="text-[#464554] leading-relaxed">
                  Spend 15 minutes today trying the HR Voice Interview mode with AI Recruiter Ratikant.
                </p>
              </div>

              <div className="p-3 bg-[#e6eeff]/60 border border-[#c7c4d7]/40 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-[#4648d4] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4648d4]" /> Resume Metric Enhancement
                </div>
                <p className="text-[#464554] leading-relaxed">
                  Add measurable impact percentages to your MERN stack project descriptions in the Resume Builder.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-xs text-[#767586]">Developed by Amareswar Nayak</p>
      </div>
    </div>
  );
};
