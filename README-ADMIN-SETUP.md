# Admin Dashboard Setup (one-time, ~10 minutes)

Your site now has a real admin dashboard at `admin.html` that shows:
- Total page views and unique visitors across the whole site
- Every Jobseeker / Employer / Contact form submission, centrally
  (not just from one browser), broken down by type
- CSV export of all submissions

This is powered by **Firebase** (Google's free tier - no credit card
required for this level of usage). You need to create one free
Firebase project and paste a few keys into one file. Do this once;
it then works for every visitor to your live site.

---

## Step 1 - Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project**, give it any name (e.g. `tmscc-website`), and
   finish the setup wizard (you can disable Google Analytics if asked,
   it isn't needed).

## Step 2 - Create the database

1. In the left sidebar: **Build > Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode**, pick any location close to
   India, click **Enable**.

## Step 3 - Turn on the admin login

1. In the left sidebar: **Build > Authentication**.
2. Click **Get started**.
3. Click the **Email/Password** provider, toggle it **Enabled**, click **Save**.
4. Go to the **Users** tab (still under Authentication) > **Add user**.
5. Enter the email and password you (the admin) want to sign in with
   on `admin.html`. This is the only account that can view the dashboard.

## Step 4 - Set the security rules

Still in Firestore Database, click the **Rules** tab and replace the
contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /site_stats/{docId} {
      allow read: if request.auth != null;
      allow write: if true;
    }

    match /submissions/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /page_views/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

Click **Publish**.

This means: any visitor's browser can record a page view or submit a
form, but only someone signed in with the admin account from Step 3
can actually read that data back - which is exactly what `admin.html`
does.

## Step 5 - Get your config keys

1. Click the gear icon (top left) > **Project settings**.
2. Scroll to **Your apps**, click the **</>** (web) icon.
3. Give the app any nickname, click **Register app** (skip Firebase
   Hosting - you don't need it since your site is on GitHub Pages).
4. It will show a code block containing a `firebaseConfig` object.
   Copy the values.

## Step 6 - Paste the keys into your site

Open `js/firebase-config.js` in your site files and replace the
placeholder values with the real ones from Step 5:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

Save the file, then re-upload/commit it (along with the rest of the
site) to GitHub. That's it - visits and form submissions will now
start recording immediately, and you can sign in at
`yoursite.com/admin.html` with the email/password from Step 3 to see
them.

---

## Notes

- **Free tier limits:** Firestore's free "Spark" plan gives 50,000
  document reads and 20,000 writes per day - far more than a site
  like this will need.
- **Changing the admin password:** Firebase Console > Authentication >
  Users > (your user) > you can reset the password there anytime.
- **Adding a second admin:** repeat Step 3.4 for another email/password.
- **If admin.html shows "Firebase isn't configured yet":** it means
  `js/firebase-config.js` still has the placeholder `YOUR_API_KEY`
  values - go back to Step 6.
