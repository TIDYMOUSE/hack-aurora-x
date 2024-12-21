// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzlDEbSYVFEfXtPs-GUw2qdt8lj67-XI8",
  authDomain: "hack-aurora-x.firebaseapp.com",
  projectId: "hack-aurora-x",
  storageBucket: "hack-aurora-x.firebasestorage.app",
  messagingSenderId: "779680110323",
  appId: "1:779680110323:web:655d94655e726430330986",
  measurementId: "G-FXJV7BH90S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
// const analytics = getAnalytics(app);
