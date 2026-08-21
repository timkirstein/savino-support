import { hasAnalyticsConsent, onConsentAccepted } from "./cookie-consent.js";

// Google Ads conversion tracking (Search-1 campaign) — "Utgående klick" /
// "Klick på nedladdningsknapp" conversion action, savino.no.
const AW_ID = "AW-18395465832";
const CONVERSION_LABEL = "AW-18395465832/V2VJCLzNruUcEOiQ0sNE";

/** Loads gtag.js and configures the Google Ads tag. */
function bootstrapGoogleAds() {
  if (typeof window === "undefined" || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${AW_ID}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", AW_ID);
}

/** Delegated click listener for every "Last ned"-button on the site — mirrors meta-pixel.js's download_click. */
function attachDownloadClickTracking() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest('[data-track="download_click"]');
    if (!target) return;
    if (!hasAnalyticsConsent() || !window.gtag) return;

    window.gtag("event", "conversion", {
      send_to: CONVERSION_LABEL,
      value: 1.0,
      currency: "NOK",
    });
  });
}

function init() {
  attachDownloadClickTracking();

  if (hasAnalyticsConsent()) {
    bootstrapGoogleAds();
  } else {
    onConsentAccepted(bootstrapGoogleAds);
  }
}

init();
