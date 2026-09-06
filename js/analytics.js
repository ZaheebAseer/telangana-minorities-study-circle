// Records a page view every load, and a unique visitor once per
// browser session (so repeat navigation within one visit only
// counts as one "visitor"). Writes to Firestore doc: site_stats/counters.

document.addEventListener("DOMContentLoaded", () => {
  if (!window.tmsccFirebaseReady || !window.tmsccDb) return;

  const db = window.tmsccDb;
  const statsRef = db.collection("site_stats").doc("counters");
  const increment = firebase.firestore.FieldValue.increment(1);

  const isNewSession = !sessionStorage.getItem("tmscc_visitor_counted");
  const updates = { pageViews: increment };
  if (isNewSession) {
    updates.uniqueVisitors = increment;
    sessionStorage.setItem("tmscc_visitor_counted", "1");
  }

  statsRef.set(updates, { merge: true }).catch((err) => {
    console.warn("Analytics write failed:", err.message);
  });

  // Also log a lightweight per-page-view record for a "recent activity" feed.
  db.collection("page_views").add({
    page: document.body.dataset.page || document.title || "unknown",
    path: window.location.pathname,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(() => {});
});
