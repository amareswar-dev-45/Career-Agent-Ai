import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDusQ1vi1zbPmjeMv2VS8UPXFDtYXbdgSk",
  authDomain: "career-ai-83927.firebaseapp.com",
  projectId: "career-ai-83927",
  storageBucket: "career-ai-83927.firebasestorage.app",
  messagingSenderId: "100731068445",
  appId: "1:100731068445:web:13b14f71bfb4872613a6f4",
  measurementId: "G-JWYLVP9LZ7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
};
