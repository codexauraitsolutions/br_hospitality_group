# Firebase Setup Guide — BR Hospitality Group

This app uses **Firestore** as its database and **Firebase Authentication** (email/password) for admin/staff logins. Follow these steps once to create the project and get the keys this app needs.

---

## STEP 1 — Create the Firebase project

1. Go to https://console.firebase.google.com and sign in with your Google account.
2. Click **Add project**.
3. Name it (e.g. `br-hospitality-group`) → click **Continue**.
4. Disable Google Analytics for this project (not needed) → click **Create project**.
5. Wait for it to finish, then click **Continue**.

---

## STEP 2 — Enable Firestore

1. In the left sidebar, click **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** (we lock it down fully in Step 5 anyway).
4. Pick a location close to your users (e.g. `asia-south1` for India) — **this cannot be changed later**.
5. Click **Enable**.

---

## STEP 3 — Enable Email/Password Authentication

1. In the left sidebar, click **Build → Authentication**.
2. Click **Get started**.
3. Click **Email/Password** in the provider list → toggle **Enable** → **Save**.
4. You do **not** need to manually add users here — the seed script (Step 6) creates the first admin, and the admin panel's Staff page creates the rest.

---

## STEP 4 — Get your Web app config (client keys)

1. Click the gear icon (⚙) next to **Project Overview** → **Project settings**.
2. Scroll to **Your apps** → click the **</>** (web) icon.
3. Nickname it `br-hospitality-web` → click **Register app** (skip the hosting step).
4. Copy the `firebaseConfig` values shown — you'll need `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.

---

## STEP 5 — Get your Service Account key (admin/server keys)

1. Still in **Project settings**, click the **Service accounts** tab.
2. Click **Generate new private key** → confirm → a `.json` file downloads.
3. Open that file. You need three values from it: `project_id`, `client_email`, `private_key`.

**Keep this file secret — it has full read/write access to your database. Never commit it to git.**

---

## STEP 6 — Fill in `.env.local`

1. Copy `.env.local.example` to a new file named `.env.local` in the project root.
2. Fill in the Firebase section:

```
NEXT_PUBLIC_FIREBASE_API_KEY=<apiKey from Step 4>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<authDomain from Step 4>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId from Step 4>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storageBucket from Step 4>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId from Step 4>
NEXT_PUBLIC_FIREBASE_APP_ID=<appId from Step 4>

FIREBASE_PROJECT_ID=<project_id from Step 5 JSON>
FIREBASE_CLIENT_EMAIL=<client_email from Step 5 JSON>
FIREBASE_PRIVATE_KEY="<private_key from Step 5 JSON — keep the \n's and the quotes>"
```

The `private_key` in the JSON file looks like `"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"` — paste it exactly as-is, quotes and all.

3. Also set the seed admin account you want to log in as first:

```
SEED_ADMIN_EMAIL=you@example.com
SEED_ADMIN_PASSWORD=choose-a-strong-password
SEED_ADMIN_NAME=Your Name
```

---

## STEP 7 — Lock down Firestore security rules

All reads/writes in this app go through the Next.js server (using the Admin SDK, which bypasses rules) — nothing talks to Firestore directly from the browser. So the rules should simply deny everything:

1. In Firestore → **Rules** tab, replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

2. Click **Publish**.

---

## STEP 8 — Run the seed script

Once `.env.local` is filled in (Step 6) and `npm install` has been run:

```bash
npm run seed
```

This creates your first `super_admin` login and seeds the 7 verticals, testimonials, team members, and site settings with the current site content, so the admin panel isn't empty on first login.

Then run `npm run dev` and log in at `/login` with your `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
