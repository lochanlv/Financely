import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
// Replace these values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDPMf2y-s0QxNRQgTYEO3UPR-IL6Ov6Izg",
  authDomain: "financely-expense-tracke-ad122.firebaseapp.com",
  projectId: "financely-expense-tracke-ad122",
  storageBucket: "financely-expense-tracke-ad122.firebasestorage.app",
  messagingSenderId: "393371608787",
  appId: "1:393371608787:web:9018f3134435a39df7d626",
  measurementId: "G-LHWCNKXZH4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
