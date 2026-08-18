// Place at: src/app/robots.ts
// Next.js automatically serves this at yoursite.com/robots.txt

import type { MetadataRoute } from "next";

const SITE_URL = "https://mt-smart.com"; // ← confirm/update this

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"], // don't let crawlers index your API routes
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}