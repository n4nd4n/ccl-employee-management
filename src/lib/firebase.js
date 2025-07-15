import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCxP_RJrujOWXaqTxPoSUjdXLas0kqgzXc",
  authDomain: "ccl-employee-management.firebaseapp.com",
  projectId: "ccl-employee-management",
  storageBucket: "ccl-employee-management.appspot.com", // fixed this line
  messagingSenderId: "338659344810",
  appId: "1:338659344810:web:cf18de3de5214045e7ebd3",
  measurementId: "G-0JT8EPK996" // optional
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
