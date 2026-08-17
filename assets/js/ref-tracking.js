import { hasAnalyticsConsent, onConsentAccepted } from "./cookie-consent.js";

const REF_KEY = "savino_ref";

/** The persisted campaign ref (e.g. "meta_aug2026"), if one was ever captured. */
export function getRef() {
  return localStorage.getItem(REF_KEY) || null;
}

const firebaseConfig = {
  apiKey: "AIzaSyCoNj8jhauPfhoVr-XBSH5DWcjH4he5IaA",
  authDomain: "grapemate-f80e3.firebaseapp.com",
  projectId: "grapemate-f80e3",
  storageBucket: "grapemate-f80e3.firebasestorage.app",
  messagingSenderId: "139205326696",
  appId: "1:139205326696:web:2471fecec63f6eef5388dd",
  measurementId: "G-GGS48F5ZSE",
};

let firebaseHandlesPromise = null;

/** Lazily loads + initializes Firebase (Analytics + Firestore) — only ever called once consent is granted. */
function getFirebaseHandles() {
  if (!firebaseHandlesPromise) {
    firebaseHandlesPromise = (async () => {
      const [{ initializeApp }, { getAnalytics, logEvent }, { getFirestore, collection, addDoc, serverTimestamp }] =
        await Promise.all([
          import("https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js"),
          import("https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js"),
          import("https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"),
        ]);
      const app = initializeApp(firebaseConfig);
      return {
        analytics: getAnalytics(app),
        db: getFirestore(app),
        logEvent,
        collection,
        addDoc,
        serverTimestamp,
      };
    })();
  }
  return firebaseHandlesPromise;
}

function captureRefFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref")?.trim().toLowerCase();
  return ref || null;
}

function isLandingPage() {
  return window.location.pathname === "/" || window.location.pathname === "/index.html";
}

/** Captures ?ref= on the landing page, persists it, and logs a landing_page_visit event + referrals doc. */
async function trackLandingPageRef() {
  if (!isLandingPage()) return;
  const ref = captureRefFromUrl();
  if (!ref) return;

  localStorage.setItem(REF_KEY, ref);

  const { analytics, db, logEvent, collection, addDoc, serverTimestamp } = await getFirebaseHandles();
  logEvent(analytics, "landing_page_visit", { ref });
  try {
    await addDoc(collection(db, "referrals"), { ref, timestamp: serverTimestamp() });
  } catch (err) {
    console.error("Kunne ikke lagre referral i Firestore", err);
  }
}

/** Delegated click listener for every "Last ned"-button on the site. */
function attachDownloadClickTracking() {
  document.addEventListener("click", async (event) => {
    const target = event.target.closest('[data-track="download_click"]');
    if (!target) return;
    if (!hasAnalyticsConsent()) return;

    const ref = localStorage.getItem(REF_KEY) || "direct";
    const store = target.dataset.store || "unknown";
    const { analytics, logEvent } = await getFirebaseHandles();
    logEvent(analytics, "download_click", { ref, store });
  });
}

function init() {
  attachDownloadClickTracking();

  if (hasAnalyticsConsent()) {
    trackLandingPageRef();
  } else {
    onConsentAccepted(trackLandingPageRef);
  }
}

init();
