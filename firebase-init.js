// Initializes Firebase once and exposes shared handles.
// Safe to include on every page - if firebase-config.js still has
// placeholder values, tracking/admin features simply stay inactive
// instead of breaking the page.

window.tmsccFirebaseReady = false;

(function initFirebase() {
  try {
    if (typeof firebase === "undefined" || typeof firebaseConfig === "undefined") {
      return;
    }
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
      console.info("Firebase not configured yet - see js/firebase-config.js");
      return;
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    window.tmsccDb = firebase.firestore();
    window.tmsccAuth = firebase.auth();
    window.tmsccFirebaseReady = true;
  } catch (err) {
    console.warn("Firebase init skipped:", err.message);
  }
})();
