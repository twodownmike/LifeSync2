import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBODxsazcWZiANa_3eTjPL3ZZNVMdnaDvQ",
  authDomain: "lifesync-91884.firebaseapp.com",
  projectId: "lifesync-91884",
  storageBucket: "lifesync-91884.firebasestorage.app",
  messagingSenderId: "481070215124",
  appId: "1:481070215124:web:4a6c1185bbd77099cbf041"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'lifesync-91884';
