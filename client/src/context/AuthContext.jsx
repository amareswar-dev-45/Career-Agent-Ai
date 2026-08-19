import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from '../firebase/config';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.success) {
        setProfileData(res.data.data);
      }
    } catch (err) {
      console.warn('[AuthContext] Fetch profile warning:', err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile();
      } else {
        setProfileData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    localStorage.removeItem('careerai_token');
    return signOut(auth);
  };

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const sendOTP = async (email) => {
    const res = await api.post('/auth/otp/send', { email });
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.post('/auth/otp/verify', { email, otp });
    if (res.data.token) {
      localStorage.setItem('careerai_token', res.data.token);
    }
    return res.data;
  };

  const value = {
    currentUser,
    profileData,
    fetchProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    sendOTP,
    verifyOTP,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
