import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyDnT9zHKY5HEcX_yjEng-rkJ4CD3rSLR10",
  authDomain: "krumb-d4d6c.firebaseapp.com",
  projectId: "krumb-d4d6c",
  storageBucket: "krumb-d4d6c.firebasestorage.app",
  messagingSenderId: "288328506124",
  appId: "1:288328506124:web:271f2e0a6cd28910bc4729",
  measurementId: "G-SVVVKFJ89N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
