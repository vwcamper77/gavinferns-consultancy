export const acquisitionEnabled = process.env.SITE_ACQUISITION_ENABLED === "true"
  && Boolean(process.env.ACQUISITION_DATABASE_URL)
  && (process.env.ACQUISITION_SECURITY_KEY?.length ?? 0) >= 32;
export const attributionEnabled = acquisitionEnabled && process.env.SITE_ATTRIBUTION_ENABLED === "true";
export const gtmId = /^GTM-[A-Z0-9]+$/.test(process.env.SITE_GTM_ID ?? "") ? process.env.SITE_GTM_ID : undefined;
export const metaPixelId = /^\d{5,24}$/.test(process.env.SITE_META_PIXEL_ID ?? "") ? process.env.SITE_META_PIXEL_ID : undefined;
export const adsId = /^AW-\d+$/.test(process.env.SITE_GOOGLE_ADS_ID ?? "") ? process.env.SITE_GOOGLE_ADS_ID : undefined;
export const adsLabel = /^[a-zA-Z0-9_-]{1,80}$/.test(process.env.SITE_GOOGLE_ADS_LEAD_LABEL ?? "") ? process.env.SITE_GOOGLE_ADS_LEAD_LABEL : undefined;
export const mailEnabled = acquisitionEnabled && process.env.SITE_ZOHO_AUTOMATION_ENABLED === "true";
