import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

export const firebaseConfig = {
  apiKey: appletConfig?.apiKey || "AIzaSyBsmHhRmjT9FRytyD6GY8tm57p8X9PQ8TU",
  authDomain: appletConfig?.authDomain || "elon-capital.firebaseapp.com",
  projectId: appletConfig?.projectId || "elon-capital",
  storageBucket: appletConfig?.storageBucket || "elon-capital.firebasestorage.app",
  messagingSenderId: appletConfig?.messagingSenderId || "363773895492",
  appId: appletConfig?.appId || "1:363773895492:web:e7f82be91aaa07a2276d11",
  measurementId: appletConfig?.measurementId || "G-ELN9828WNR",
  firestoreDatabaseId: appletConfig?.firestoreDatabaseId
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

