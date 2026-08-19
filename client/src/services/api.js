import axios from 'axios';
import { auth } from '../firebase/config';

// Dynamic API Base URL supporting VITE_API_URL or relative /api proxy
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Interceptor to attach Firebase ID Token to requests
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
