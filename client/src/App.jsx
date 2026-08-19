import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { AIChat } from './pages/AIChat';
import { InterviewSimulator } from './pages/InterviewSimulator';
import { PDFStudy } from './pages/PDFStudy';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { ATSChecker } from './pages/ATSChecker';
import { Settings } from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="interviews" element={<InterviewSimulator />} />
            <Route path="pdf-study" element={<PDFStudy />} />
            <Route path="resume-builder" element={<ResumeBuilder />} />
            <Route path="ats-checker" element={<ATSChecker />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
