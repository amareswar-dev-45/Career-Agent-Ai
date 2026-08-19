import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Mic,
  MicOff,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Bot,
  User,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/Button';
import api from '../services/api';

export const AIChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your CareerAI Assistant. Ask me anything about placement prep, technical topics, resumes, or interview strategy!',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice Assistant state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState('IDLE'); // IDLE, LISTENING, PROCESSING, AI_SPEAKING, ERROR
  const [voiceErrorMessage, setVoiceErrorMessage] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, voiceState]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load chat history:', err);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await api.get(`/chat/${id}`);
      if (res.data.success) {
        setActiveConvId(id);
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  // Speak AI response automatically using browser Text-to-Speech
  const speakTextAuto = (text, onEndCallback) => {
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setVoiceState('AI_SPEAKING');
    };

    utterance.onend = () => {
      setVoiceState('IDLE');
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('TTS Speech error:', e);
      setVoiceState('IDLE');
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('IDLE');
  };

  const sendMessage = async (textToSend, autoSpeak = false) => {
    if (!textToSend.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
    setInputMessage('');
    setLoading(true);
    setVoiceState('PROCESSING');

    try {
      const res = await api.post('/chat', {
        conversationId: activeConvId,
        message: textToSend,
      });

      if (res.data.success) {
        const aiMsg = res.data.data.message;
        setActiveConvId(res.data.data.conversationId);
        setMessages((prev) => [...prev, aiMsg]);
        fetchHistory();

        if (autoSpeak || isVoiceMode) {
          speakTextAuto(aiMsg.content);
        } else {
          setVoiceState('IDLE');
        }
      }
    } catch (err) {
      console.error('[Chat API Error]:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Error generating response. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${errMsg}` },
      ]);
      setVoiceState('ERROR');
      setVoiceErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage, false);
  };

  const startVoiceListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (voiceState === 'LISTENING') {
      recognitionRef.current?.stop();
      setVoiceState('IDLE');
      return;
    }

    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceState('LISTENING');
      setIsVoiceMode(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        sendMessage(transcript, true);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition Error:', event.error);
      setVoiceState('ERROR');
      setVoiceErrorMessage(`Speech Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      if (voiceState === 'LISTENING') {
        setVoiceState('IDLE');
      }
    };

    recognition.start();
  };

  const handleNewChat = () => {
    stopSpeaking();
    setActiveConvId(null);
    setMessages([
      {
        role: 'assistant',
        content: 'Started a new conversation! What topic would you like to prepare today?',
      },
    ]);
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConvId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Delete chat error:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar: Chat History */}
        <div className="w-64 bg-white border border-[#e6eeff] rounded-xl p-4 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-3">
            <Button variant="primary" className="w-full justify-start" onClick={handleNewChat}>
              <Plus className="w-4 h-4 mr-2" /> New Conversation
            </Button>

            <div className="text-xs font-semibold text-[#767586] uppercase tracking-wider px-2 pt-2">
              History
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => loadConversation(conv._id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                    activeConvId === conv._id
                      ? 'bg-[#e6eeff] text-[#4648d4] font-semibold'
                      : 'text-[#464554] hover:bg-[#f8f9ff]'
                  }`}
                >
                  <span className="truncate">{conv.title}</span>
                  <button
                    onClick={(e) => handleDeleteChat(conv._id, e)}
                    className="text-[#767586] hover:text-[#ba1a1a] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-xs text-[#767586] px-2 py-4">No past conversations.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 bg-white border border-[#e6eeff] rounded-xl flex flex-col justify-between overflow-hidden shadow-sm">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#e6eeff] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#4648d4] text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[#121c2a]">CareerAI Text & Voice Assistant</h2>
              </div>
            </div>

            {/* Voice State Badge Indicator */}
            <div className="flex items-center gap-2">
              {voiceState === 'LISTENING' && (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span> Listening...
                </span>
              )}

              {voiceState === 'PROCESSING' && (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-[#e6eeff] text-[#4648d4] rounded-full">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[#4648d4]" /> Processing...
                </span>
              )}

              {voiceState === 'AI_SPEAKING' && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full hover:bg-emerald-200 transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-bounce" /> AI Speaking (Click to Mute)
                </button>
              )}

              {voiceState === 'ERROR' && (
                <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-[#ffdad6] text-[#93000a] rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" /> Error
                </span>
              )}

              {voiceState === 'IDLE' && (
                <span className="text-xs font-medium px-2.5 py-0.5 bg-[#f8f9ff] text-[#767586] border border-[#e6eeff] rounded-full">
                  Ready
                </span>
              )}
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#f8f9ff]/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white ${
                    msg.role === 'user' ? 'bg-[#121c2a]' : 'bg-[#4648d4]'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-xl text-sm leading-relaxed shadow-sm space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-[#4648d4] text-white rounded-tr-none'
                      : 'bg-white border border-[#e6eeff] text-[#121c2a] rounded-tl-none'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-3 pt-2 border-t border-[#e6eeff] text-xs text-[#767586]">
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="flex items-center gap-1 hover:text-[#4648d4] transition"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button
                        onClick={() => speakTextAuto(msg.content)}
                        className="flex items-center gap-1 hover:text-[#4648d4] transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Replay Voice
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-lg bg-[#4648d4] text-white flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e6eeff] text-xs text-[#767586] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4648d4] animate-spin" /> Generating response...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleTextSubmit} className="p-4 border-t border-[#e6eeff] bg-white flex gap-3 items-center">
            <button
              type="button"
              onClick={startVoiceListening}
              className={`p-3 rounded-xl border font-semibold text-xs flex items-center gap-2 transition ${
                voiceState === 'LISTENING'
                  ? 'bg-red-50 border-red-500 text-red-600 animate-pulse'
                  : 'border-[#c7c4d7] text-[#4648d4] hover:bg-[#e6eeff]'
              }`}
              title={voiceState === 'LISTENING' ? 'Listening... Speak now!' : 'Click to Speak'}
            >
              {voiceState === 'LISTENING' ? (
                <>
                  <MicOff className="w-4 h-4 text-red-600" /> Stop
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#4648d4]" /> Voice Mode
                </>
              )}
            </button>

            <input
              type="text"
              placeholder={
                voiceState === 'LISTENING'
                  ? 'Listening to your voice...'
                  : 'Ask about computer science, placement prep, DBMS, HR questions...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 border border-[#c7c4d7] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            />

            <Button type="submit" variant="primary" loading={loading} disabled={!inputMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="text-center pt-2 pb-1">
        <p className="text-xs text-[#767586]">Developed by Amareswar Nayak</p>
      </div>
    </div>
  );
};
