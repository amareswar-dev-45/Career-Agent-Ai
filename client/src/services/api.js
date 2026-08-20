import axios from 'axios';
import { auth } from '../firebase/config';

// Dynamic API Base URL resolution: supports environment variable, Vercel production backend, or local proxy
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'https://career-agent-ai-bsjv-pi.vercel.app/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Interceptor to attach Firebase ID Token or custom JWT token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const customToken = localStorage.getItem('careerai_token');
      if (customToken) {
        config.headers.Authorization = `Bearer ${customToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
