// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration object
// Note: In a real application, these would be environment variables
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "ccl-employee-management.firebaseapp.com",
  projectId: "ccl-employee-management",
  storageBucket: "ccl-employee-management.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

