import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPc41rg9WfOgnWRBObDkjJwHNz4JBbW7I",
  authDomain: "ten-infinity.firebaseapp.com",
  projectId: "ten-infinity",
  storageBucket: "ten-infinity.firebasestorage.app",
  messagingSenderId: "126097246157",
  appId: "1:126097246157:web:6dd1a83a470dcc4826a684",
  measurementId: "G-272B4X7G0H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };