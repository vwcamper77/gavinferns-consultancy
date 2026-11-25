import type { MetadataRoute } from "next";
import { canIndex, routes, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return canIndex ? ["", ...routes].map((route) => ({ url: route ? `${site.url}/${route}` : site.url })) : [];
}
