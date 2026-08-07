// Client-side Firebase SDK — used only for Auth (sign-in/sign-out) in the browser.
// All Firestore reads/writes happen server-side via lib/firebaseAdmin.ts.
//
// getFirebaseAuth() is a lazy getter (not a top-level singleton) so that
// `next build`'s server-side render of client-component pages never calls
// getAuth() before .env.local is configured. Always call the function —
// never cache its result across module scope.
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let cachedApp: FirebaseApp | null = null
function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return cachedApp
}

let cachedAuth: Auth | null = null
export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth
  cachedAuth = getAuth(getFirebaseApp())
  return cachedAuth
}
