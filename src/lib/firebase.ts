import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getAuth, type Auth } from "firebase/auth";

// Firebase web config. These values are NOT secrets (they ship to the client by
// design; real protection comes from the Realtime Database Security Rules), but
// we still read them from `.env` per project rule #2 and keep `.env` out of git.
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const config: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// True only when every config value is present, so the UI can show a helpful
// message instead of crashing when `.env` has not been filled in yet.
export const isFirebaseConfigured: boolean = Object.values(config).every(
  (value) => typeof value === "string" && value.length > 0,
);

let app: FirebaseApp | undefined;
let database: Database | undefined;
let auth: Auth | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  database = getDatabase(app);
  auth = getAuth(app);
}

const NOT_CONFIGURED_MESSAGE =
  "Firebase não está configurado. Preencha as variáveis VITE_FIREBASE_* no arquivo .env.";

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }
  return app;
}

export function getDb(): Database {
  if (!database) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }
  return database;
}

export function getAuthInstance(): Auth {
  if (!auth) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }
  return auth;
}
