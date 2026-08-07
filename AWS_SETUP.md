# AWS S3 Setup Guide — BR Hospitality Group

This app stores all uploaded photos/videos (vertical galleries, banners, team photos, testimonial avatars) in an S3 bucket. Uploads go **directly from the browser to S3** using short-lived presigned URLs, and deleting a file in the admin panel **also deletes it from S3** — so this bucket only ever contains files the app actually knows about.

---

## STEP 1 — Create an AWS account (skip if you already have one)

Go to https://aws.amazon.com → **Create an AWS Account** → follow the signup flow (requires a card on file, but S3 at this scale costs a few cents/month).

---

## STEP 2 — Create the S3 bucket

1. Go to https://s3.console.aws.amazon.com → **Create bucket**.
2. **Bucket name**: something globally unique, e.g. `br-hospitality-group-media` (must be all lowercase, no spaces).
3. **Region**: pick one close to your users, e.g. `ap-south-1` (Mumbai). Note this exact region string — you'll need it.
4. **Block Public Access settings**: uncheck **Block all public access**, then check the acknowledgement box. (We'll scope public access down to just the media prefix with a bucket policy in Step 4 — the bucket itself isn't fully public.)
5. Leave everything else default → **Create bucket**.

---

## STEP 3 — Configure CORS (required for direct browser uploads)

1. Open your new bucket → **Permissions** tab → scroll to **Cross-origin resource sharing (CORS)** → **Edit**.
2. Paste this (add your real production domain once you have one; `localhost:3000` is for local development):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. **Save changes**.

---

## STEP 4 — Bucket policy (public read for uploaded media)

Since these are public marketing photos/videos (not private data), grant public **read** access so the website can display them:

1. **Permissions** tab → **Bucket policy** → **Edit**.
2. Paste (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForMedia",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. **Save changes**. (Only `GetObject`/read is public — uploads and deletes always go through the app's server-signed requests, never directly from a browser without a token.)

---

## STEP 5 — Create an IAM user scoped to just this bucket

Don't use your root AWS account's keys. Create a dedicated user with only the permissions this app needs:

1. Go to https://console.aws.amazon.com/iam → **Users** → **Create user**.
2. Name it `br-hospitality-app` → **Next** (no console access needed).
3. **Attach policies directly** → **Create policy** (opens a new tab):
   - Switch to the **JSON** tab and paste (replace `YOUR-BUCKET-NAME`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```
   - Name the policy `br-hospitality-s3-access` → **Create policy**.
4. Back in the create-user tab, refresh the policy list, select `br-hospitality-s3-access` → **Next** → **Create user**.

---

## STEP 6 — Generate access keys for that user

1. Click into the `br-hospitality-app` user → **Security credentials** tab.
2. Scroll to **Access keys** → **Create access key**.
3. Choose **Application running outside AWS** → **Next** → **Create access key**.
4. **Copy both the Access key ID and Secret access key now** — the secret is only shown once.

---

## STEP 7 — Fill in `.env.local`

```
AWS_REGION=<region from Step 2, e.g. ap-south-1>
AWS_ACCESS_KEY_ID=<Access key ID from Step 6>
AWS_SECRET_ACCESS_KEY=<Secret access key from Step 6>
AWS_S3_BUCKET_NAME=<bucket name from Step 2>
```

---

## How delete-cascade works

Every uploaded file gets one `media` document in Firestore holding its S3 object key. When you delete media anywhere in the admin panel (a vertical's gallery, a banner tile, a team photo, a testimonial avatar), the app calls S3's `DeleteObject` for that exact key **before** removing the Firestore record — so nothing is ever left orphaned in the bucket. You can verify this any time in the S3 console by checking the bucket's object count before/after a delete.
