import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2ozyNazwGOWNjduh3EWZXrzys_5TFSPI",
  authDomain: "riveraproject-auth.firebaseapp.com",
  projectId: "riveraproject-auth",
  storageBucket: "riveraproject-auth.firebasestorage.app",
  messagingSenderId: "381380616869",
  appId: "1:381380616869:web:d16cf7953530cbb5cd634c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Auth
export const auth = getAuth(app);
export default app;