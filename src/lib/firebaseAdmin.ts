// Server-only Firebase Admin SDK — used by API routes and server components.
// Full read/write access, bypasses Firestore security rules by design (see FIREBASE_SETUP.md).
//
// adminDb()/adminAuth() are lazy singleton FUNCTIONS (not Proxy-wrapped values) so that
// `next build` still works before .env.local is configured, without risking the SDK's
// internal `this`-bound state being written to the wrong object (a Proxy without a `set`
// trap silently writes instance-mutated state to the proxy's backing object instead of
// the real client, which caused intermittent auth/Firestore failures).
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getAuth, type Auth } from 'firebase-admin/auth'

let cachedApp: App | null = null

function getAdminApp(): App {
  if (cachedApp) return cachedApp
  if (getApps().length) { cachedApp = getApps()[0]; return cachedApp }

  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin env vars — check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local (see FIREBASE_SETUP.md)')
  }

  cachedApp = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return cachedApp
}

let cachedDb: Firestore | null = null
export function adminDb(): Firestore {
  if (!cachedDb) cachedDb = getFirestore(getAdminApp())
  return cachedDb
}

let cachedAuth: Auth | null = null
export function adminAuth(): Auth {
  if (!cachedAuth) cachedAuth = getAuth(getAdminApp())
  return cachedAuth
}
