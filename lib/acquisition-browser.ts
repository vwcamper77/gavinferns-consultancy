import { parseTouch, utmKeys, uuid } from "./acquisition";
import { activeCampaign } from "./campaigns";

export const preferenceKey = "gavinferns-consent-v2";
export const preferenceEvent = "gavinferns-consent-change";
const attributionKey = "gavinferns-attribution";
const duration = 90 * 86400 * 1000;
const maxAge = 90 * 86400;
const types = { measurement: "gf-measurement", advertising: "gf-advertising" } as const;
export type Choice = { measurement: boolean; advertising: boolean };
type Touch = ReturnType<typeof parseTouch>;
type Touches = { first: Touch; last: Touch; expires: number };

export function readChoice(): Choice | null {
  try {
    const answer = JSON.parse(localStorage.getItem(preferenceKey) ?? "null");
    if (answer?.expires > Date.now() && typeof answer.measurement === "boolean" && typeof answer.advertising === "boolean") return answer;
  } catch { /* Storage can be disabled by the visitor. */ }
  return null;
}

export function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(preferenceKey, JSON.stringify({ ...choice, expires: Date.now() + duration }));
    if (!choice.measurement) localStorage.removeItem(attributionKey);
  } catch { /* Optional tracking stays off when storage is unavailable. */ }
  syncChoiceCookies(readChoice());
  const optionalCookies = document.cookie.split(";").map((entry) => entry.trim().split("=")[0]);
  for (const name of optionalCookies) {
    if ((!choice.measurement && (name === "_ga" || name.startsWith("_ga_"))) ||
      (!choice.advertising && (name === "_fbp" || name === "_fbc" || name.startsWith("_gcl_")))) {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      if (location.hostname === "gavinferns.com" || location.hostname.endsWith(".gavinferns.com")) {
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=gavinferns.com`;
      }
    }
  }
  window.dispatchEvent(new Event(preferenceEvent));
}

export function syncChoiceCookies(choice: Choice | null) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  for (const key of ["measurement", "advertising"] as const) {
    document.cookie = `${types[key]}=${choice?.[key] ? "1" : ""}; Max-Age=${choice?.[key] ? maxAge : 0}; Path=/; SameSite=Lax${secure}`;
  }
}

export function readAttribution(): Touches | null {
  if (!readChoice()?.measurement) return null;
  try {
    const data = JSON.parse(localStorage.getItem(attributionKey) ?? "null");
    return data?.expires > Date.now() ? data : null;
  } catch { return null; }
}

export function captureAttribution(path: string, firstPage: boolean) {
  if (!readChoice()?.measurement) return;
  const previous = readAttribution();
  const params = new URLSearchParams(location.search);
  const campaign = activeCampaign(path.split("/")[2]) ?? activeCampaign(params.get("campaign"));
  const utm = Object.fromEntries(utmKeys.map((key) => [key, params.get(key)]));
  let source = "direct";
  if (firstPage && document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      if (referrer.origin !== location.origin) source = referrer.hostname;
    } catch { /* Missing referrer data is classified as direct. */ }
  }
  const touch = parseTouch({ ...utm, source, campaign });
  if (!previous || campaign && path.startsWith("/campaign/") || Object.keys(touch).some((key) => key.startsWith("utm_")) || source !== "direct") {
    try {
      localStorage.setItem(attributionKey, JSON.stringify({ first: previous?.first ?? touch, last: touch, expires: previous?.expires ?? Date.now() + duration }));
    } catch { /* Attribution is optional. */ }
  }
}

export function attributedCampaign(path = location.pathname) {
  const params = new URLSearchParams(location.search);
  return activeCampaign(path.startsWith("/campaign/") ? path.split("/")[2] : params.get("campaign")) ?? readAttribution()?.last.campaign;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[][]; loaded?: boolean; version?: string };
    _fbq?: Window["fbq"];
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function googleTag(..._args: unknown[]) {
  void _args;
  // Google's tag API uses the Arguments object.
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer ??= []).push(arguments);
}

let enabled = false;
export function enableFirstPartyMeasurement(value: boolean) { enabled = value; }

export function trackPublic(event: "website_visit" | "landing_visit" | "calculator_interaction" | "application_start") {
  if (!readChoice()?.measurement) return false;
  const campaign = attributedCampaign();
  if (enabled) {
    void fetch("/api/acquisition/telemetry", {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ id: crypto.randomUUID(), event, campaign }),
    }).catch(() => {});
  }
  if (location.pathname === "/apply") return true;
  (window.dataLayer ??= []).push({ event: "gf_" + event, campaign_key: campaign ?? "unattributed" });
  googleTag("event", event === "website_visit" ? "page_view" : event, { campaign_key: campaign ?? "unattributed", page_location: location.origin + location.pathname, page_referrer: "" });
  return true;
}

export function trackCompletion(eventId: string, sendTo?: string) {
  const choice = readChoice();
  if (choice?.measurement) {
    (window.dataLayer ??= []).push({ event: "gf_application_completed" });
    googleTag("event", "generate_lead", { page_location: location.origin + "/apply" });
  }
  if (choice?.advertising) {
    window.fbq?.("track", "Lead", {}, { eventID: eventId });
    if (sendTo) googleTag("event", "conversion", { send_to: sendTo, transaction_id: eventId, page_location: location.origin + "/apply" });
  }
}


const receiptKey = "gavinferns-application-receipt";
export function storeApplicationReceipt(id: string) {
  if (!readChoice()?.measurement && !readChoice()?.advertising) return;
  try { sessionStorage.setItem(receiptKey, id); } catch { /* No conversion state is kept without browser storage. */ }
}
export function recordApplicationReceipt(sendTo?: string) {
  try {
    const id = sessionStorage.getItem(receiptKey);
    sessionStorage.removeItem(receiptKey);
    if (id && uuid.test(id)) trackCompletion(id, sendTo);
  } catch { /* Submission does not depend on conversion measurement. */ }
}
