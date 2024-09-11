// src/firebase.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue } from 'firebase/database'; // Import Realtime Database functions

// Your web app's Firebase configuration (use your provided config)
const firebaseConfig = {
  apiKey: "AIzaSyA4thvpea5ZRf5xfe4IWpxdZ8JWzafMSZ8",
  authDomain: "arcade-scores.firebaseapp.com",
  databaseURL: "https://arcade-scores-default-rtdb.firebaseio.com", // Add the Database URL here
  projectId: "arcade-scores",
  storageBucket: "arcade-scores.appspot.com",
  messagingSenderId: "203630832909",
  appId: "1:203630832909:web:0462986fd4c16f5a38d444",
  measurementId: "G-WCC9RWEGC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database, ref, set, push, onValue };
