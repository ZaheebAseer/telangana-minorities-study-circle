// ============================================================
// FIREBASE CONFIGURATION
// ------------------------------------------------------------
// 1. Go to https://console.firebase.google.com
// 2. Create a free project (no credit card needed).
// 3. Inside the project: Build > Firestore Database > Create
//    database > Start in production mode > choose a location.
// 4. Inside the project: Build > Authentication > Get started >
//    enable the "Email/Password" sign-in method.
// 5. Still in Authentication > Users tab > Add user. Create the
//    one admin login (email + password) you'll use to view the
//    admin dashboard.
// 6. Go to Project settings (gear icon) > General > scroll to
//    "Your apps" > click the </> (web) icon > register an app
//    (no need for Firebase Hosting) > copy the firebaseConfig
//    object it gives you and paste the VALUES below.
// 7. Go to Firestore Database > Rules tab and paste the rules
//    from README-ADMIN-SETUP.md, then click Publish.
// ============================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
