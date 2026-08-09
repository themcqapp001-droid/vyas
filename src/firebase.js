import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup,
         signInWithEmailAndPassword, createUserWithEmailAndPassword,
         onAuthStateChanged, signOut } from "firebase/auth";
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(cfg);
export const auth = getAuth(app);
export const googleSignIn = () => signInWithPopup(auth, new GoogleAuthProvider());
export const emailSignIn  = (e, p) => signInWithEmailAndPassword(auth, e, p);
export const emailSignUp  = (e, p) => createUserWithEmailAndPassword(auth, e, p);
export const watchAuth    = (cb) => onAuthStateChanged(auth, cb);
export const logout       = () => signOut(auth);
export const idToken      = async () => (auth.currentUser ? auth.currentUser.getIdToken() : null);
