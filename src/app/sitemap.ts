// Place at: src/app/sitemap.ts
// Next.js automatically serves this at yoursite.com/sitemap.xml — no
// route file or manual XML needed.

import type { MetadataRoute } from "next";

const SITE_URL = "https://mt-smart.com"; // ← confirm/update this

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Since this is a single-page site with in-page section anchors, each
  // section gets its own sitemap entry (Google does index anchor-linked
  // sections meaningfully, especially when they have distinct, substantial
  // content, as your Solutions/Sector Solutions/Why Us sections do).
  const sections = [
    "",
    "#about",
    "#solutions",
    "#sector-solutions",
    "#why-us",
    "#journey",
    "#contact",
  ];

  return sections.map((section) => ({
    url: `${SITE_URL}/${section}`,
    lastModified,
    changeFrequency: section === "" ? "weekly" : "monthly",
    priority: section === "" ? 1 : 0.7,
  }));
}