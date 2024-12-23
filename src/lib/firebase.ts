// Import the functions you need from the SDKs you need
import { PUBLIC_API_KEY, PUBLIC_AUTH_DOMAIN, PUBLIC_DB_URL, PUBLIC_PROJECT_ID, PUBLIC_STORAGE_BUCKET, PUBLIC_MESSAGING_SENDER_ID, PUBLIC_APP_ID, PUBLIC_MEASUREMENT_ID} from '$env/static/public'
import { deleteApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { browserSessionPersistence, GoogleAuthProvider, inMemoryPersistence, setPersistence} from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: PUBLIC_API_KEY,
    authDomain: PUBLIC_AUTH_DOMAIN,
    databaseURL: PUBLIC_DB_URL,
    projectId: PUBLIC_PROJECT_ID,
    storageBucket: PUBLIC_STORAGE_BUCKET,
    messagingSenderId:  PUBLIC_MESSAGING_SENDER_ID,
    appId: PUBLIC_APP_ID,
    measurementId: PUBLIC_MEASUREMENT_ID
};
// Initialize Firebase
let app: FirebaseApp;
if(!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
    deleteApp(app);
    app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence)
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();