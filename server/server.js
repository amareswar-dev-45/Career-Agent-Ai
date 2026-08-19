import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import atsRoutes from './routes/atsRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Logging middleware for request tracking
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.url} | IP: ${req.ip}`);
  }
  next();
});

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ats', atsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'CareerAI API Server',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler with detailed logging
app.use((err, req, res, next) => {
  console.error(`[Server Error ${req.method} ${req.url}]:`);
  console.error(`User ID: ${req.user ? req.user._id : 'Unauthenticated'}`);
  console.error(`Error Stack:`, err.stack || err.message);
  
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDev && { error: err.message, stack: err.stack }),
  });
});

// Start Server & DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 CareerAI Server running on port ${PORT}`);
    console.log(`=================================`);
  });
});
