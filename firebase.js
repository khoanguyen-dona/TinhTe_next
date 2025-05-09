
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY , 
  authDomain: "tinhte-5b23b.firebaseapp.com",
  projectId: "tinhte-5b23b",
  storageBucket: "tinhte-5b23b.firebasestorage.app",
  messagingSenderId: "325647210072",
  appId: "1:325647210072:web:7c3d540f6b515c802b1c2d",
  measurementId: "G-6NW14X3YT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app