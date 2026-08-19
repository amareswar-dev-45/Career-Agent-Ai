import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, UserPlus, CheckCircle2, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import api from '../services/api';

export const Signup = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Step 1 Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2-Step Signup flow: 'FORM' | 'OTP'
  const [signupStep, setSignupStep] = useState('FORM');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'success' | 'error' | 'info'
  const [loading, setLoading] = useState(false);

  // OTP 5-minute timer (300 seconds)
  const [otpTimerSeconds, setOtpTimerSeconds] = useState(300);
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  useEffect(() => {
    let interval = null;
    if (signupStep === 'OTP' && otpTimerSeconds > 0) {
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
  }, [signupStep, otpTimerSeconds]);

  const formatOtpTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Submit Form & Send Email Verification OTP
  const handleInitiateSignup = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Send OTP to exact user email address
      const res = await api.post('/auth/otp/send', { email });
      if (res.data.success) {
        setSignupStep('OTP');
        setOtpTimerSeconds(300);
        setIsOtpExpired(false);
        setStatusMessage(`A 6-digit verification code has been sent to ${email}.`);
        setStatusType('info');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send verification OTP. Please verify email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Signup
  const handleVerifyOtpAndCompleteSignup = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

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

    setLoading(true);
    try {
      // 1. Verify OTP with backend
      const verRes = await api.post('/auth/otp/verify', { email, otp: otpCode });
      if (verRes.data.success) {
        // 2. Create account in Firebase Auth
        await signup(email, password);

        // 3. Update MongoDB user profile with emailVerified: true
        try {
          await api.put('/profile', { name, emailVerified: true });
        } catch (pErr) {
          console.warn('Profile sync warning:', pErr);
        }

        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed';
      setStatusMessage(msg);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await api.post('/auth/otp/send', { email });
      if (res.data.success) {
        setOtpTimerSeconds(300);
        setIsOtpExpired(false);
        setStatusMessage(`New verification code sent to ${email}.`);
        setStatusType('info');
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to resend OTP.');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#e6eeff] rounded-2xl p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#4648d4] text-white flex items-center justify-center font-black mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#121c2a]">Create CareerAI Account</h1>
          <p className="text-xs text-[#767586]">
            {signupStep === 'FORM' ? 'Join thousands of students mastering their career path' : 'Verify your email to complete registration'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-[#ffdad6] text-[#93000a] rounded-lg border border-[#ba1a1a]/20 font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {signupStep === 'FORM' && (
          <>
            <form onSubmit={handleInitiateSignup} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="student@university.edu"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                <UserPlus className="w-4 h-4 mr-2" /> Verify Email & Register
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
              onClick={handleGoogleSignup}
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
              Sign Up with Google
            </Button>
          </>
        )}

        {/* STEP 2: Email Verification OTP */}
        {signupStep === 'OTP' && (
          <form onSubmit={handleVerifyOtpAndCompleteSignup} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#767586]">
                Verification code sent to <strong>{email}</strong>
              </p>
              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                isOtpExpired ? 'bg-red-100 text-red-700' : 'bg-[#e6eeff] text-[#4648d4]'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{isOtpExpired ? 'OTP Expired' : `OTP expires in ${formatOtpTime(otpTimerSeconds)}`}</span>
              </div>
            </div>

            <Input
              label="6-Digit Verification OTP"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={isOtpExpired}
              required
            />

            {statusMessage && (
              <div
                className={`p-3 text-xs rounded-lg flex items-center gap-2 font-semibold ${
                  statusType === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {statusType === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={loading}
                disabled={isOtpExpired}
              >
                Verify & Create Account
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleResendOTP}
                loading={loading}
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Resend
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setSignupStep('FORM')}
              className="text-xs text-[#767586] hover:underline text-center w-full block pt-2"
            >
              ← Edit Signup Details
            </button>
          </form>
        )}

        <p className="text-center text-xs text-[#767586]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4648d4] font-semibold hover:underline">
            Sign In
          </Link>
        </p>

        <div className="text-center pt-2">
          <p className="text-[11px] text-[#767586]">Developed by Amareswar Nayak</p>
        </div>
      </div>
    </div>
  );
};
