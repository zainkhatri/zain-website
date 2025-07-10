// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, remove, get } from 'firebase/database';

// Firebase configuration using environment variables with fallbacks
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://demo-project-default-rtdb.firebaseio.com/",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:demo",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-DEMO"
};

// Initialize Firebase with error handling
let app;
let database;

try {
  // Check if we have real Firebase config (not fallback values)
  const hasRealConfig = process.env.REACT_APP_FIREBASE_API_KEY && 
                       process.env.REACT_APP_FIREBASE_DATABASE_URL &&
                       process.env.REACT_APP_FIREBASE_PROJECT_ID;
  
  if (hasRealConfig) {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('Firebase initialized successfully with real configuration');
  } else {
    console.log('Firebase environment variables not found, using local storage fallback');
    database = null;
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  database = null;
}

export { database, ref, set, push, onValue, remove, get };
