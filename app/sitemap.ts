import type { MetadataRoute } from "next";
import { canIndex, caseStudyPaths, routes, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return canIndex ? ["", ...routes, ...caseStudyPaths].map((route) => ({ url: route ? `${site.url}/${route}` : site.url })) : [];
}

