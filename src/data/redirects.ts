// Old static-site URLs (c5.html, ec75.html#cargo, ...) keep working.
// The browser re-attaches #fragments after a redirect, so ec75.html#passenger
// still opens the passenger variant.
const modelSlugs = [
  "ec75", "r5", "ec75pro-passenger", "ec75pro-cargo", "r5pro-passenger", "r5pro-cargo", "ec35", "ec31", "c9",
  "c5", "c5-cng", "c5-reev", "c5l", "c3", "ed71s", "ec31l", "ec31s", "c3-cold", "r5-service", "c5-drone"
];

export const legacyRedirects = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/register.html", destination: "/register/", permanent: true },
  { source: "/warranty.html", destination: "/warranty/", permanent: true },
  ...modelSlugs.map((slug) => ({ source: `/${slug}.html`, destination: `/models/${slug}/`, permanent: true }))
];
