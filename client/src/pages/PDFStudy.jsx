import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Trash2,
  Send,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import api from '../services/api';

export const PDFStudy = () => {
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Upload a study PDF (e.g. Java_Notes.pdf, OS_Concepts.pdf) and ask any questions grounded in your document!',
    },
  ]);
  const [queryText, setQueryText] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
        if (res.data.data.length > 0 && !activeDoc) {
          setActiveDoc(res.data.data[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load documents:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF document.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        await fetchDocuments();
        setActiveDoc(res.data.data);
        alert('PDF processed and knowledge vector embeddings created!');
      }
    } catch (err) {
      alert('PDF upload processing failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      if (activeDoc?._id === id) {
        setActiveDoc(null);
      }
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  const handleSendQuery = async (e) => {
    e?.preventDefault();
    if (!queryText.trim() || !activeDoc || queryLoading) return;

    const userQ = queryText;
    setQueryText('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userQ }]);
    setQueryLoading(true);

    try {
      const res = await api.post(`/documents/${activeDoc._id}/chat`, {
        message: userQ,
      });

      if (res.data.success) {
        const { answer, sources } = res.data.data;
        let formattedAnswer = answer;

        if (sources && sources.length > 0) {
          const sourceText = sources.map((s) => `• **Page ${s.pageNumber}**: "${s.textSnippet}"`).join('\n');
          formattedAnswer += `\n\n---\n**Source Page References:**\n${sourceText}`;
        }

        setChatMessages((prev) => [...prev, { role: 'assistant', content: formattedAnswer }]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'An error occurred while querying the document.' },
      ]);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Left Sidebar: PDF Document Manager */}
      <div className="w-72 bg-white border border-[#e6eeff] rounded-xl p-4 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#121c2a] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4648d4]" /> PDF Knowledge Base
            </h2>
          </div>

          <label className="border-2 border-dashed border-[#c7c4d7] hover:border-[#4648d4] bg-[#f8f9ff] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center space-y-2">
            <UploadCloud className="w-6 h-6 text-[#4648d4]" />
            <div>
              <span className="text-xs font-semibold text-[#121c2a]">Upload PDF Study Notes</span>
              <p className="text-[10px] text-[#767586]">Up to 15MB (.pdf)</p>
            </div>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>

          {uploading && (
            <div className="p-3 bg-[#e6eeff] rounded-lg text-xs font-medium text-[#4648d4] text-center animate-pulse">
              Extracting text & generating vector embeddings...
            </div>
          )}

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-20rem)] pr-1">
            {documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => setActiveDoc(doc)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                  activeDoc?._id === doc._id
                    ? 'border-[#4648d4] bg-[#e6eeff]/60 font-semibold'
                    : 'border-[#e6eeff] bg-white hover:border-[#c7c4d7]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-[#4648d4] shrink-0" />
                  <div className="truncate">
                    <div className="truncate text-[#121c2a]">{doc.fileName}</div>
                    <div className="text-[10px] text-[#767586]">{doc.chunkCount || 0} Chunks</div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteDoc(doc._id, e)}
                  className="text-[#767586] hover:text-[#ba1a1a] p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {documents.length === 0 && (
              <p className="text-xs text-[#767586] text-center py-6">No PDFs uploaded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 bg-white border border-[#e6eeff] rounded-xl flex flex-col justify-between overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e6eeff] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4648d4] text-white flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#121c2a]">
                {activeDoc ? `Chatting with: ${activeDoc.fileName}` : 'Select or Upload a PDF'}
              </h2>
              <p className="text-[11px] text-[#767586]">Grounded RAG retrieval with source page citations</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#f8f9ff]/50">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white ${
                  msg.role === 'user' ? 'bg-[#121c2a]' : 'bg-[#4648d4]'
                }`}
              >
                {msg.role === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
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
              </div>
            </div>
          ))}

          {queryLoading && (
            <div className="p-4 rounded-xl bg-white border border-[#e6eeff] text-xs text-[#767586] flex items-center gap-2 max-w-md">
              <Sparkles className="w-4 h-4 text-[#4648d4] animate-spin" /> Searching document vectors & generating answer...
            </div>
          )}
        </div>

        <form onSubmit={handleSendQuery} className="p-4 border-t border-[#e6eeff] bg-white flex gap-3 items-center">
          <input
            type="text"
            placeholder={activeDoc ? `Ask any question about ${activeDoc.fileName}...` : 'Upload a PDF on the left to start asking questions...'}
            disabled={!activeDoc}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="flex-1 border border-[#c7c4d7] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4] disabled:bg-gray-100"
          />

          <Button type="submit" variant="primary" loading={queryLoading} disabled={!queryText.trim() || !activeDoc}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
