"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  captureAttribution, enableFirstPartyMeasurement, googleTag, preferenceEvent, preferenceKey, readChoice, recordApplicationReceipt, saveChoice, syncChoiceCookies, trackPublic,
} from "@/lib/acquisition-browser";

function subscribe(callback: () => void) {
  window.addEventListener(preferenceEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(preferenceEvent, callback);
    window.removeEventListener("storage", callback);
  };
}
const getSnapshot = () => {
  const value = readChoice();
  return value ? `${Number(value.measurement)}${Number(value.advertising)}` : "";
};
const serverSnapshot = () => "";

export function AnalyticsConsent({ measurementId, gtmId, metaId, adsId, adsLabel, attribution }: {
  measurementId?: string; gtmId?: string; metaId?: string; adsId?: string; adsLabel?: string; attribution: boolean;
}) {
  const choice = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  const path = usePathname();
  const lastTracked = useRef("");
  const lastMetaLanding = useRef("");
  const isPrivate = /^\/(sales|booking|marketing-preferences)(\/|$)/.test(path);
  const isApplication = path === "/apply";
  const measurement = choice[0] === "1" && !isPrivate;
  const advertising = choice[1] === "1" && !isPrivate;
  const canAdvertise = Boolean(metaId || adsId);
  const canMeasure = Boolean(measurementId || gtmId || attribution);
  const googleId = !isApplication && ((measurement && measurementId) || (advertising && adsId)) || undefined;

  useEffect(() => {
    if (isPrivate || isApplication || (!measurement && !advertising)) return;
    googleTag("consent", "default", {
      analytics_storage: measurement ? "granted" : "denied",
      ad_storage: advertising ? "granted" : "denied",
      ad_user_data: advertising ? "granted" : "denied",
      ad_personalization: "denied",
    });
    googleTag("js", new Date());
    googleTag("set", "url_passthrough", false);
    if (measurement && measurementId) googleTag("config", measurementId, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname, page_referrer: "",
    });
    if (advertising && adsId) googleTag("config", adsId, {
      send_page_view: false, allow_ad_personalization_signals: false, page_location: location.origin + location.pathname, page_referrer: "",
    });
    if (measurement && gtmId) (window.dataLayer ??= []).push({ "gtm.start": Date.now(), event: "gtm.js" });
  }, [adsId, advertising, gtmId, isApplication, isPrivate, measurement, measurementId]);

  useEffect(() => {
    syncChoiceCookies(readChoice());
    enableFirstPartyMeasurement(attribution);
    if (measurementId) window[`ga-disable-${measurementId}`] = !measurement;
    if (isPrivate || !measurement || lastTracked.current === path) return;
    if (attribution) captureAttribution(path, !lastTracked.current);
    lastTracked.current = path;
    trackPublic("website_visit");
    if (path.startsWith("/campaign/")) trackPublic("landing_visit");
  }, [attribution, isPrivate, measurement, measurementId, path]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === preferenceKey) {
        syncChoiceCookies(readChoice());
        window.location.reload();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!advertising || !metaId || isApplication) return;
    if (!window.fbq) {
      const fbq: NonNullable<Window["fbq"]> = (...args) => {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue?.push(args);
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = window._fbq = fbq;
      fbq("set", "autoConfig", false, metaId);
      fbq("init", metaId);
      fbq("consent", "grant");
    }
  }, [advertising, isApplication, metaId]);

  useEffect(() => {
    if (!advertising || !metaId || !path.startsWith("/campaign/") || lastMetaLanding.current === path) return;
    lastMetaLanding.current = path;
    window.fbq?.("track", "PageView");
  }, [advertising, metaId, path]);

  useEffect(() => {
    if (path === "/application-received" && choice) recordApplicationReceipt(adsId && adsLabel ? `${adsId}/${adsLabel}` : undefined);
  }, [adsId, adsLabel, choice, path]);

  function choose(nextMeasurement: boolean, nextAdvertising: boolean) {
    const withdrawing = (measurement && !nextMeasurement) || (advertising && !nextAdvertising);
    if (advertising && !nextAdvertising) window.fbq?.("consent", "revoke");
    if (measurementId) window[`ga-disable-${measurementId}`] = !nextMeasurement;
    saveChoice({ measurement: nextMeasurement, advertising: nextAdvertising });
    if (withdrawing) window.location.reload();
  }

  if (isPrivate || (!canMeasure && !canAdvertise)) return null;
  return <section className={`analytics-settings${choice ? "" : " analytics-prompt"}`} id="analytics-settings" aria-labelledby="analytics-heading">
    <div className="container">
      <h2 id="analytics-heading">Privacy and tracking settings</h2>
      <p>Choose whether we can measure website and campaign performance. Optional tracking is off until you allow it. You can change your choices at any time.</p>
      <div className="actions">
        {canMeasure && <button className="button button-light" type="button" aria-pressed={measurement} onClick={() => choose(!measurement, advertising)}>{measurement ? "Turn off measurement" : "Allow measurement"}</button>}
        {canAdvertise && <button className="button button-light" type="button" aria-pressed={advertising} onClick={() => choose(measurement, !advertising)}>{advertising ? "Turn off advertising measurement" : "Allow advertising measurement"}</button>}
        <button className="button button-light" type="button" aria-pressed={choice === "00"} onClick={() => choose(false, false)}>Decline optional tracking</button>
      </div>
    </div>
    {googleId && <Script key={googleId} src={`https://www.googletagmanager.com/gtag/js?id=${googleId}`} />}
    {!isApplication && measurement && gtmId && <Script id="campaign-gtm" src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} />}
    {!isApplication && advertising && metaId && <Script src="https://connect.facebook.net/en_GB/fbevents.js" />}
  </section>;
}
