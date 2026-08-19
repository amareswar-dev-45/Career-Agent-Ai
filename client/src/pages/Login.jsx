import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, LogIn, CheckCircle2, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import api from '../services/api';

export const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal steps: 'EMAIL', 'OTP', 'NEW_PASSWORD', 'SUCCESS'
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('EMAIL');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // OTP 5-minute countdown timer (300 seconds)
  const [otpTimerSeconds, setOtpTimerSeconds] = useState(300);
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  // Status banners
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'success' | 'error' | 'info'

  // 5-minute countdown timer effect
  useEffect(() => {
    let interval = null;
    if (showForgotModal && forgotStep === 'OTP' && otpTimerSeconds > 0) {
      interval = setInterval(() => {
        setOtpTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsOtpExpired(true);
            setStatusMessage('OTP has expired. Please request a new OTP.');
            setStatusType('error');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showForgotModal, forgotStep, otpTimerSeconds]);

  const formatOtpTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    }
  };

  const openForgotPasswordModal = () => {
    setForgotEmail(email);
    setForgotStep('EMAIL');
    setStatusMessage('');
    setStatusType('info');
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOtpTimerSeconds(300);
    setIsOtpExpired(false);
    setShowForgotModal(true);
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!forgotEmail) {
      setStatusMessage('Please enter your email address.');
      setStatusType('error');
      return;
    }
    setModalLoading(true);
    setStatusMessage('');
    try {
      const res = await api.post('/auth/otp/send', { email: forgotEmail });
      if (res.data.success) {
        setForgotStep('OTP');
        setOtpTimerSeconds(300); // Reset 5-minute countdown
        setIsOtpExpired(false);
        setStatusMessage(res.data.message || 'OTP sent to your email.');
        setStatusType('info');
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Unable to send OTP. Please try again.');
      setStatusType('error');
    } finally {
      setModalLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (isOtpExpired) {
      setStatusMessage('OTP has expired. Please request a new OTP.');
      setStatusType('error');
      return;
    }
    if (!otpCode) {
      setStatusMessage('Please enter the 6-digit OTP code.');
      setStatusType('error');
      return;
    }
    setModalLoading(true);
    setStatusMessage('');
    try {
      const res = await api.post('/auth/otp/verify', { email: forgotEmail, otp: otpCode });
      if (res.data.success && res.data.resetToken) {
        setResetToken(res.data.resetToken);
        setForgotStep('NEW_PASSWORD');
        setStatusMessage('OTP verified successfully');
        setStatusType('success');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid OTP.';
      setStatusMessage(errMsg);
      setStatusType('error');
    } finally {
      setModalLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setStatusMessage('Passwords do not match.');
      setStatusType('error');
      return;
    }
    if (newPassword.length < 6) {
      setStatusMessage('Password must be at least 6 characters long.');
      setStatusType('error');
      return;
    }
    setModalLoading(true);
    setStatusMessage('');
    try {
      const res = await api.post('/auth/reset-password', {
        resetToken,
        newPassword,
      });
      if (res.data.success) {
        setForgotStep('SUCCESS');
        setStatusMessage('Password updated successfully!');
        setStatusType('success');
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to update password');
      setStatusType('error');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#e6eeff] rounded-2xl p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#4648d4] text-white flex items-center justify-center font-black mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#121c2a]">Welcome to CareerAI</h1>
          <p className="text-xs text-[#767586]">Sign in to access your placement preparation hub</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-[#ffdad6] text-[#93000a] rounded-lg border border-[#ba1a1a]/20 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="student@university.edu"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end text-xs pt-1">
              <button
                type="button"
                onClick={openForgotPasswordModal}
                className="text-[#4648d4] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            <LogIn className="w-4 h-4 mr-2" /> Sign In
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#e6eeff] w-full" />
          <span className="bg-white px-3 text-xs text-[#767586] uppercase font-semibold">Or</span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-xs text-[#767586]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#4648d4] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>

        <div className="text-center pt-2">
          <p className="text-[11px] text-[#767586]">Developed by Amareswar Nayak</p>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      <Modal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} title="Forgot Password Recovery">
        {forgotStep === 'EMAIL' && (
          <div className="space-y-4">
            <p className="text-xs text-[#767586]">
              Enter your email address below to receive a 6-digit verification code.
            </p>
            <Input
              label="Email Address"
              type="email"
              placeholder="student@university.edu"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            {statusMessage && (
              <div
                className={`p-3 text-xs rounded-lg flex items-center gap-2 font-medium ${
                  statusType === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {statusType === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{statusMessage}</span>
              </div>
            )}
            <Button variant="primary" className="w-full" onClick={handleSendOTP} loading={modalLoading}>
              Send OTP via Email
            </Button>
          </div>
        )}

        {forgotStep === 'OTP' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#767586]">
                Enter 6-digit code sent to <strong>{forgotEmail}</strong>
              </p>
              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                isOtpExpired ? 'bg-red-100 text-red-700' : 'bg-[#e6eeff] text-[#4648d4]'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{isOtpExpired ? 'OTP Expired' : `OTP expires in ${formatOtpTime(otpTimerSeconds)}`}</span>
              </div>
            </div>

            <Input
              label="6-Digit OTP Code"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={isOtpExpired}
            />

            {statusMessage && (
              <div
                className={`p-3 text-xs rounded-lg flex items-center gap-2 font-semibold ${
                  statusType === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : statusType === 'success'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-[#e6eeff] text-[#4648d4]'
                }`}
              >
                {statusType === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleVerifyOTP}
                loading={modalLoading}
                disabled={isOtpExpired}
              >
                Verify OTP
              </Button>
              <Button
                variant="secondary"
                onClick={handleSendOTP}
                loading={modalLoading}
                title="Resend new OTP code"
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Resend
              </Button>
            </div>
          </div>
        )}

        {forgotStep === 'NEW_PASSWORD' && (
          <div className="space-y-4">
            {statusMessage && (
              <div
                className={`p-3 text-xs rounded-lg flex items-center gap-2 font-semibold ${
                  statusType === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{statusMessage}</span>
              </div>
            )}
            <p className="text-xs text-[#767586]">Create a new password for your account.</p>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <Button variant="primary" className="w-full" onClick={handleResetPassword} loading={modalLoading}>
              Update Password
            </Button>
          </div>
        )}

        {forgotStep === 'SUCCESS' && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-[#121c2a]">Password Reset Complete!</h3>
            <p className="text-xs text-[#767586]">
              Your new password is now active. You can sign in using your new credentials.
            </p>
            <Button variant="primary" className="w-full" onClick={() => setShowForgotModal(false)}>
              Back to Login
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
