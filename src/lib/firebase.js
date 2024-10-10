import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "chat-53865.firebaseapp.com",
    projectId: "chat-53865",
    storageBucket: "chat-53865.appspot.com",
    messagingSenderId: "769798699620",
    appId: "1:769798699620:web:325478fa50cd899905fd71",
    measurementId: "G-R4HH3Y2QF0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();