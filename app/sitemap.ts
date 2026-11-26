import type { MetadataRoute } from "next";
import { campaigns } from "@/lib/campaigns";
import { canIndex, caseStudyPaths, routes, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return canIndex ? ["", ...routes, ...caseStudyPaths, ...Object.entries(campaigns).filter(([, campaign]) => campaign.active).map(([key]) => `campaign/${key}`)].map((route) => ({ url: route ? `${site.url}/${route}` : site.url })) : [];
}
