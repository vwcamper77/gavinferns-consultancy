import type { MetadataRoute } from "next";
import { canIndex, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(canIndex && { sitemap: `${site.url}/sitemap.xml` }),
  };
}
