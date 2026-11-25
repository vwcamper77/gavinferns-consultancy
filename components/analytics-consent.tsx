"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";

const consentKey = "gavinferns-analytics";
const consentEvent = "analytics-choice";

function subscribe(callback: () => void) {
  window.addEventListener(consentEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(consentEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function getChoice() {
  try {
    return localStorage.getItem(consentKey);
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    dataLayer?: IArguments[];
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function AnalyticsConsent({ measurementId }: { measurementId: string }) {
  const choice = useSyncExternalStore(subscribe, getChoice, () => null);
  const disableKey = `ga-disable-${measurementId}` as const;

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === consentKey && event.oldValue === "allow" && event.newValue !== "allow") {
        window[disableKey] = true;
        window.location.reload();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [disableKey]);

  function saveChoice(allow: boolean) {
    window[disableKey] = !allow;
    try {
      localStorage.setItem(consentKey, allow ? "allow" : "decline");
    } catch {
      return;
    }
    if (!allow) {
      for (const entry of document.cookie.split(";")) {
        const name = entry.trim().split("=")[0];
        if (name === "_ga" || name.startsWith("_ga_")) {
          document.cookie = `${name}=; Max-Age=0; Path=/`;
          document.cookie = `${name}=; Max-Age=0; Path=/; Domain=gavinferns.com`;
        }
      }
      if (choice === "allow") window.location.reload();
    }
    window.dispatchEvent(new Event(consentEvent));
  }

  function startAnalytics() {
    if (getChoice() !== "allow") return;
    const dataLayer = window.dataLayer ??= [];
    function gtag(...args: unknown[]) {
      // Google Tag's documented command queue accepts an Arguments object.
      // eslint-disable-next-line prefer-rest-params
      if (args.length) dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", measurementId, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }

  return <section className="analytics-settings" id="analytics-settings" aria-labelledby="analytics-heading">
    <div className="container">
      <h2 id="analytics-heading">Analytics settings</h2>
      <p>Allow Google Analytics to measure how people use the site. You can change your choice at any time.</p>
      <div className="actions">
        <button className="button" type="button" aria-pressed={choice === "allow"} onClick={() => saveChoice(true)}>Allow analytics</button>
        <button className="button button-light" type="button" aria-pressed={choice === "decline"} onClick={() => saveChoice(false)}>Decline analytics</button>
      </div>
    </div>
    {choice === "allow" && <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} onLoad={startAnalytics} />}
  </section>;
}
