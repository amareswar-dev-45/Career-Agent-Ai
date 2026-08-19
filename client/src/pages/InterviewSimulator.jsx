import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BrainCircuit,
  Mic,
  MicOff,
  Volume2,
  UserCheck,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TextArea } from '../components/Input';
import api from '../services/api';
import ratikantImg from '../../ratikant.jpeg';

const CATEGORIES = [
  { id: 'Technical', label: 'Technical', description: 'Coding, CS fundamentals, Web Dev, Databases & System Design' },
  { id: 'HR', label: 'HR Interview (Voice UI)', description: 'Voice-based HR interview with visual AI Recruiter Ratikant' },
  { id: 'Aptitude', label: 'Aptitude', description: 'Quantitative, numerical reasoning, data interpretation' },
  { id: 'Reasoning', label: 'Logical Reasoning', description: 'Pattern recognition, logical deductions, puzzles' },
  { id: 'Behavioral', label: 'Behavioral', description: 'STAR method situational & conflict handling questions' },
];

const TOPICS_MAP = {
  Technical: ['React', 'JavaScript', 'Node.js', 'Java', 'Python', 'DBMS & SQL', 'DSA', 'OOP Principles'],
  HR: ['Self Introduction', 'Strengths & Weaknesses', 'Career 5-Year Goal', 'Salary Expectations', 'Team Conflict'],
  Aptitude: ['Quantitative Aptitude', 'Probability & Statistics', 'Time & Work', 'Data Interpretation'],
  Reasoning: ['Logical Reasoning', 'Pattern Recognition', 'Syllogism', 'Analytical Puzzles'],
  Behavioral: ['Leadership Experience', 'Failure Handling', 'Under Pressure Work', 'Problem Solving'],
};

export const InterviewSimulator = () => {
  const [selectedCategory, setSelectedCategory] = useState('Technical');
  const [selectedTopic, setSelectedTopic] = useState('React');
  const [difficulty, setDifficulty] = useState('Medium');

  const [activeSession, setActiveSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  const [timerSeconds, setTimerSeconds] = useState(0);

  // HR Voice & Avatar Lip-Sync Speaking State
  const [hrVoiceState, setHrVoiceState] = useState('IDLE'); // 'IDLE' | 'SPEAKING_QUESTION' | 'LISTENING_ANSWER'
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [mouthState, setMouthState] = useState('CLOSED'); // 'CLOSED' | 'SMALL' | 'MEDIUM'
  const recognitionRef = useRef(null);

  useEffect(() => {
    let interval;
    if (activeSession && !finalReport) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, finalReport]);

  // Natural speaking rhythm mouth animation tied directly to audio playback state
  useEffect(() => {
    let mouthInterval;
    if (isAvatarSpeaking) {
      const mouthPhases = ['SMALL', 'CLOSED', 'MEDIUM', 'SMALL', 'CLOSED', 'MEDIUM', 'CLOSED'];
      let phaseIdx = 0;
      mouthInterval = setInterval(() => {
        phaseIdx = (phaseIdx + 1) % mouthPhases.length;
        setMouthState(mouthPhases[phaseIdx]);
      }, 180); // Natural 180ms speaking cadence
    } else {
      setMouthState('CLOSED');
    }
    return () => clearInterval(mouthInterval);
  }, [isAvatarSpeaking]);

  // Automatically speak question aloud & synchronize lip-sync animation when question changes
  useEffect(() => {
    if (activeSession && selectedCategory === 'HR' && currentQuestion && !finalReport) {
      speakQuestionAloud(currentQuestion);
    }
  }, [currentQuestion, activeSession, selectedCategory]);

  const speakQuestionAloud = (text) => {
    if (!('speechSynthesis' in window)) return;

    // Stop candidate mic recognition if running
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Synchronize avatar speaking state directly with audio events
    utterance.onstart = () => {
      setHrVoiceState('SPEAKING_QUESTION');
      setIsAvatarSpeaking(true);
    };

    utterance.onend = () => {
      setHrVoiceState('IDLE');
      setIsAvatarSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setHrVoiceState('IDLE');
      setIsAvatarSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListeningVoiceAnswer = () => {
    // Prevent candidate mic recording while AI audio is still playing
    if (isAvatarSpeaking) {
      alert('AI Recruiter Ratikant is currently speaking. Please wait for him to finish asking the question!');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (hrVoiceState === 'LISTENING_ANSWER') {
      recognitionRef.current?.stop();
      setHrVoiceState('IDLE');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAvatarSpeaking(false);
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setHrVoiceState('LISTENING_ANSWER');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognition.onerror = (e) => {
      console.warn('Speech Recognition Error:', e.error);
      setHrVoiceState('IDLE');
    };

    recognition.onend = () => {
      setHrVoiceState('IDLE');
    };

    recognition.start();
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setFinalReport(null);
    setTimerSeconds(0);

    try {
      const res = await api.post('/interviews', {
        type: selectedCategory,
        topic: selectedTopic,
        difficulty,
      });

      if (res.data.success) {
        const id = res.data.sessionId || res.data.interviewId || res.data.data?.interviewId;
        const qText = res.data.question || res.data.currentQuestion || res.data.data?.currentQuestion;
        setActiveSession(id);
        setCurrentQuestion(qText);
        setQuestionIndex(0);
        setAnswerText('');
      }
    } catch (err) {
      alert('Failed to start interview session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (!answerText.trim() || loading) return;
    setLoading(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAvatarSpeaking(false);
    }

    try {
      const res = await api.post(`/interviews/${activeSession}/answer`, {
        answer: answerText,
      });

      if (res.data.success) {
        if (res.data.isCompleted) {
          setFinalReport(res.data.data);
        } else {
          setCurrentQuestion(res.data.data.currentQuestion);
          setQuestionIndex(res.data.data.questionIndex);
          setAnswerText('');
        }
      }
    } catch (err) {
      alert('Error evaluating answer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isHR = selectedCategory === 'HR';
  const isLastQuestion = questionIndex === 4;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between border-b border-[#e6eeff] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#121c2a] flex items-center gap-2">
            <Video className="w-7 h-7 text-[#4648d4]" /> Adaptive AI Interview Simulator
          </h1>
          <p className="text-xs text-[#767586] mt-1">
            Standard 5-question interviews with step-by-step scoring and special voice HR interview mode.
          </p>
        </div>
      </div>

      {/* Setup Screen */}
      {!activeSession && !finalReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTopic(TOPICS_MAP[cat.id][0]);
                }}
                className={`p-5 rounded-xl border cursor-pointer transition ${
                  selectedCategory === cat.id
                    ? 'border-[#4648d4] bg-[#e6eeff]/50 shadow-sm ring-1 ring-[#4648d4]'
                    : 'border-[#e6eeff] bg-white hover:border-[#c7c4d7]'
                }`}
              >
                <div className="font-bold text-sm text-[#121c2a] flex items-center justify-between">
                  <span>{cat.label}</span>
                  {cat.id === 'HR' && <span className="text-[10px] bg-[#4648d4] text-white px-2 py-0.5 rounded-full font-extrabold">VOICE UI</span>}
                </div>
                <div className="text-xs text-[#767586] mt-1.5 leading-relaxed">{cat.description}</div>
              </div>
            ))}
          </div>

          <Card title="Configure Interview Parameters">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#121c2a] mb-2">Select Target Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full border border-[#c7c4d7] rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-[#4648d4]"
                >
                  {(TOPICS_MAP[selectedCategory] || []).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#121c2a] mb-2">Difficulty Level</label>
                <div className="flex gap-2">
                  {['Easy', 'Medium', 'Hard', 'Adaptive'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                        difficulty === lvl
                          ? 'bg-[#4648d4] text-white border-[#4648d4]'
                          : 'bg-white border-[#c7c4d7] text-[#464554] hover:bg-[#e6eeff]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e6eeff] flex justify-end">
              <Button variant="primary" size="lg" onClick={handleStartInterview} loading={loading}>
                <Play className="w-5 h-5 mr-2" /> Start 5-Question Interview
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Active Question Interface */}
      {activeSession && !finalReport && (
        <div className="space-y-6">
          {/* SPECIAL HR VOICE UI */}
          {isHR ? (
            <div className="bg-white border border-[#e6eeff] rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-[#e6eeff] pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#4648d4] text-white font-bold text-xs rounded-full">
                    HR Voice Question {questionIndex + 1} of 5
                  </span>
                  <span className="text-xs font-semibold text-[#767586]">{selectedTopic}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4648d4] bg-[#e6eeff] px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" /> {formatTime(timerSeconds)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Synchronized AI Recruiter Avatar Visual with Realistic Mouth Lip-Sync */}
                <div className="text-center space-y-3 p-5 bg-[#f8f9ff] rounded-2xl border border-[#e6eeff] relative overflow-hidden">
                  <div className="relative inline-block">
                    {/* Stable Face & Body Container (Image remains completely stationary) */}
                    <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      isAvatarSpeaking ? 'border-emerald-500 ring-4 ring-emerald-300/50 shadow-lg' : 'border-[#4648d4]'
                    }`}>
                      <img
                        src={ratikantImg}
                        alt="AI Recruiter Ratikant"
                        className="w-36 h-36 rounded-2xl object-cover mx-auto"
                      />

                      {/* Natural Mouth Talking Lip-Sync Layer (Only activates while AI audio is playing) */}
                      {isAvatarSpeaking && mouthState !== 'CLOSED' && (
                        <div
                          className={`absolute left-[47%] transform -translate-x-1/2 bg-[#3a1a1c] border border-[#5c2a2e] rounded-full transition-all duration-100 shadow-inner ${
                            mouthState === 'SMALL'
                              ? 'bottom-[27%] w-5 h-2'
                              : 'bottom-[26%] w-6 h-3.5'
                          }`}
                        >
                          <div className="w-full h-1 bg-[#b55b62]/80 rounded-t-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Animated Speaker Badge */}
                    {isAvatarSpeaking && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-md animate-bounce">
                        <Volume2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#121c2a] flex items-center justify-center gap-1">
                      Ratikant <UserCheck className="w-4 h-4 text-[#4648d4]" />
                    </h3>
                    <p className="text-[11px] text-[#767586]">Senior AI HR Recruiter</p>
                  </div>

                  {/* Synchronized Audio Speaking State Badge & Soundwave Visualizer */}
                  {isAvatarSpeaking ? (
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span> Asking Question...
                      </span>

                      {/* Dynamic Visual Soundwave Bars */}
                      <div className="flex items-center justify-center gap-1 h-4 pt-1">
                        <span className="w-1 bg-emerald-500 rounded-full h-3 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1 bg-emerald-600 rounded-full h-4 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1 bg-emerald-400 rounded-full h-2 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        <span className="w-1 bg-emerald-500 rounded-full h-4 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                        <span className="w-1 bg-emerald-600 rounded-full h-3 animate-bounce" style={{ animationDelay: '0.25s' }}></span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => speakQuestionAloud(currentQuestion)}
                      className="text-[11px] font-semibold text-[#4648d4] hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Replay Voice Question
                    </button>
                  )}
                </div>

                {/* Spoken Question & Candidate Response */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-[#e6eeff]/60 p-4 rounded-xl border border-[#4648d4]/30 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4648d4]">
                      HR Recruiter Spoken Question:
                    </span>
                    <h2 className="text-lg font-bold text-[#121c2a] leading-relaxed">{currentQuestion}</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#121c2a]">Candidate Voice Answer</label>
                      <button
                        type="button"
                        onClick={startListeningVoiceAnswer}
                        disabled={isAvatarSpeaking}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          isAvatarSpeaking
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : hrVoiceState === 'LISTENING_ANSWER'
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-[#4648d4] text-white hover:bg-[#3b3dbf]'
                        }`}
                      >
                        {hrVoiceState === 'LISTENING_ANSWER' ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" /> Listening... (Click to Stop)
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" /> Speak Answer (Mic)
                          </>
                        )}
                      </button>
                    </div>

                    <TextArea
                      placeholder="Speak using your mic or edit transcript here before moving to next question..."
                      rows={5}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    />

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="primary"
                        onClick={handleSaveAndNext}
                        loading={loading}
                        disabled={!answerText.trim() || isAvatarSpeaking}
                      >
                        {isLastQuestion ? 'Submit Final HR Interview' : 'Save & Next Question'} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD 5-QUESTION TEXT INTERVIEW UI */
            <div className="bg-white border border-[#e6eeff] rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#e6eeff] pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#4648d4] text-white font-bold text-xs rounded-full">
                    Question {questionIndex + 1} of 5
                  </span>
                  <span className="text-xs font-semibold text-[#767586]">{selectedCategory} • {selectedTopic}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4648d4] bg-[#e6eeff] px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" /> {formatTime(timerSeconds)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#767586] uppercase tracking-wider">AI Interviewer</div>
                <h2 className="text-xl font-bold text-[#121c2a] leading-relaxed">{currentQuestion}</h2>
              </div>

              <div className="space-y-3">
                <TextArea
                  label="Your Answer"
                  placeholder="Type your structured response here..."
                  rows={6}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />

                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-[#767586]">
                    Answer saved upon clicking {isLastQuestion ? 'Submit Final Interview' : 'Save & Next Question'}.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleSaveAndNext}
                    loading={loading}
                    disabled={!answerText.trim()}
                  >
                    {isLastQuestion ? 'Submit Final Interview' : 'Save & Next Question'} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Scorecard Report */}
      {finalReport && (
        <div className="space-y-6">
          <div className="bg-white border border-[#e6eeff] rounded-2xl p-8 shadow-card text-center space-y-4">
            <div className="w-16 h-16 bg-[#e6eeff] text-[#4648d4] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#121c2a]">Interview Completed!</h2>
              <p className="text-xs text-[#767586] mt-1">{selectedCategory} — {selectedTopic}</p>
            </div>

            <div className="inline-block bg-[#4648d4] text-white px-6 py-3 rounded-2xl font-extrabold text-3xl shadow-sm">
              {finalReport.overallScore} / 100
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
              {Object.entries(finalReport.categoryScores || {}).map(([key, score]) => (
                <div key={key} className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e6eeff] text-center space-y-1">
                  <div className="text-[11px] font-semibold text-[#767586] capitalize">{key.replace(/([AZ])/g, ' $1')}</div>
                  <div className="text-lg font-bold text-[#4648d4]">{score}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Strengths">
              <ul className="space-y-2 text-xs text-[#121c2a]">
                {(finalReport.strengths || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Areas for Improvement">
              <ul className="space-y-2 text-xs text-[#121c2a]">
                {(finalReport.weaknesses || []).map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <BrainCircuit className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Recommendations">
              <ul className="space-y-2 text-xs text-[#121c2a]">
                {(finalReport.recommendations || []).map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#4648d4] shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="primary"
              onClick={() => {
                setActiveSession(null);
                setFinalReport(null);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Start Another Practice Session
            </Button>
          </div>
        </div>
      )}

      <div className="text-center pt-8">
        <p className="text-xs text-[#767586]">Developed by Amareswar Nayak</p>
      </div>
    </div>
  );
};
