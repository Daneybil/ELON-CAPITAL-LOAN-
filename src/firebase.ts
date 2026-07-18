import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsmHhRmjT9FRytyD6GY8tm57p8X9PQ8TU",
  authDomain: "elon-capital.firebaseapp.com",
  projectId: "elon-capital",
  storageBucket: "elon-capital.firebasestorage.app",
  messagingSenderId: "363773895492",
  appId: "1:363773895492:web:e7f82be91aaa07a2276d11",
  measurementId: "G-ELN9828WNR"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
