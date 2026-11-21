import { MERGED_INTO } from "./pro";

// Old static-site URLs (c5.html, ec75.html#cargo, ...) keep working.
// The browser re-attaches #fragments after a redirect, so ec75.html#passenger
// still opens the passenger variant.
const modelSlugs = [
  "ec75", "r5", "ec35", "ec31", "c9",
  "c5", "c5-cng", "c5-reev", "c5l", "c3", "ed71s", "ec31l", "ec31s", "c3-cold", "r5-service", "c5-drone"
];

// R5 Pro / EC75 Pro live on the R5 / EC75 page since 2026-11-21 (src/data/pro.ts): their pages and old .html
// URLs open that page on the same side. Temporary (307), so splitting them again later is not cached forever.
const merged = Object.entries(MERGED_INTO).flatMap(([slug, { slug: into, variant }]) => [
  { source: `/models/${slug}/`, destination: `/models/${into}/#${variant}`, permanent: false },
  { source: `/${slug}.html`, destination: `/models/${into}/#${variant}`, permanent: false }
]);

export const legacyRedirects = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/register.html", destination: "/register/", permanent: true },
  { source: "/warranty.html", destination: "/warranty/", permanent: true },
  ...modelSlugs.map((slug) => ({ source: `/${slug}.html`, destination: `/models/${slug}/`, permanent: true })),
  ...merged
];
