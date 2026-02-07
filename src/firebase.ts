import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {});
    auth = getAuth(app);
} catch (error) {
    console.error("CRITICAL: Error during Firebase initialization:", error);
}

// Initialize Anonymous Sign-in
signInAnonymously(auth)
    .then(() => {
        console.log("Conexión anónima establecida con Firebase");
    })
    .catch((error) => {
        console.error("Error al establecer conexión anónima:", error);
    });

export { db, auth };
