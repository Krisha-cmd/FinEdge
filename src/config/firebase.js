import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPc41rg9WfOgnWRBObDkjJwHNz4JBbW7I",
  authDomain: "ten-infinity.firebaseapp.com",
  projectId: "ten-infinity",
  storageBucket: "ten-infinity.firebasestorage.app",
  messagingSenderId: "126097246157",
  appId: "1:126097246157:web:6dd1a83a470dcc4826a684",
  measurementId: "G-272B4X7G0H"
};

// Initialize Firebase with custom settings
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set timeout to 30 seconds
auth.settings = {
  ...auth.settings,
  authTokenMaxAge: 30
};

// Add initialization check
const isFirebaseInitialized = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      unsubscribe();
      resolve(true);
    });
  });
};

export { auth, isFirebaseInitialized };