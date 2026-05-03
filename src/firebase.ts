import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQH-Ar-ORryvt_9fxbKO1LW-Q0YXbNKTI",
  authDomain: "daily-goal-a6a25.firebaseapp.com",
  projectId: "daily-goal-a6a25",
  storageBucket: "daily-goal-a6a25.firebasestorage.app",
  messagingSenderId: "777120088434",
  appId: "1:777120088434:web:5150f06264719da3a75deb",
  measurementId: "G-VHEJLE43FK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 