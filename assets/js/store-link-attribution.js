import { getUtm } from "./ref-tracking.js";

/**
 * The store buttons already carry the page's own campaign (see
 * _includes/store-url.html). When the visitor arrived with UTM params (e.g.
 * an Instagram post linking to savino.no?utm_source=instagram), the store
 * links are rewritten to pass that source on instead, so the install is
 * attributed to Instagram rather than just "savino_web".
 *
 * Reads the current URL first (no storage needed), then the UTM params
 * ref-tracking.js persisted on the landing page (only with consent).
 */
function incomingUtm() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source")?.trim();
  if (source) {
    return {
      source,
      medium: params.get("utm_medium")?.trim() || null,
      campaign: params.get("utm_campaign")?.trim() || null,
    };
  }
  const stored = getUtm();
  return stored?.source ? stored : null;
}

const IOS_CT_MAX = 30;

function rewriteLinks(utm) {
  document.querySelectorAll('a[data-track="download_click"]').forEach((a) => {
    let url;
    try {
      url = new URL(a.href);
    } catch {
      return;
    }
    if (url.hostname === "apps.apple.com") {
      const ct = ["web", utm.source, utm.campaign].filter(Boolean).join("_");
      url.searchParams.set("ct", ct.slice(0, IOS_CT_MAX));
    } else if (url.hostname === "play.google.com") {
      const referrer = new URLSearchParams(url.searchParams.get("referrer") || "");
      referrer.set("utm_source", utm.source);
      if (utm.medium) referrer.set("utm_medium", utm.medium);
      if (utm.campaign) referrer.set("utm_campaign", utm.campaign);
      url.searchParams.set("referrer", referrer.toString());
    } else {
      return;
    }
    a.href = url.toString();
  });
}

const utm = incomingUtm();
if (utm) rewriteLinks(utm);
