import type { MetadataRoute } from "next";
import { canIndex, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/sales", "/application-received", "/api/", "/booking", "/marketing-preferences"] },
    ...(canIndex && { sitemap: `${site.url}/sitemap.xml` }),
  };
}
