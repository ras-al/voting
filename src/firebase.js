// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVcDB2QxSjDFigBEGFe7AHJWiS2TPrHYQ",
  authDomain: "nomination-e06c3.firebaseapp.com",
  projectId: "nomination-e06c3",
  storageBucket: "nomination-e06c3.firebasestorage.app",
  messagingSenderId: "863303773914",
  appId: "1:863303773914:web:c2a97be7a0493fc5be7fe3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
