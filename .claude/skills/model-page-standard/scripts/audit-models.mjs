// Audit every model page against the C5 standard: which parts render, which are missing.
// Usage: node audit-models.mjs [baseUrl=http://localhost:3001]  (needs the dev server running)
const base = process.argv[2] ?? "http://localhost:3001";
const home = await (await fetch(`${base}/`)).text();
const slugs = [...new Set([...home.matchAll(/href="\/models\/([^/"]+)\/"/g)].map((m) => m[1]).concat(["ec75", "r5", "c9", "c3-cold", "r5-service"]))].sort();
const count = (html, re) => (html.match(re) ?? []).length;
const rows = [];
for (const slug of slugs) {
  const res = await fetch(`${base}/models/${slug}/`);
  if (!res.ok) { rows.push({ slug, status: res.status }); continue; }
  const html = await res.text();
  const chapters = [...html.matchAll(/class="section mchapter mchapter--\w+" id="(\w+)"/g)].map((m) => m[1]).join("+");
  rows.push({
    slug,
    hero: html.includes('class="mintro"') ? "intro" : html.includes("mhero") ? "photo" : "?",
    strip: count(html, /class="hero__quick-spec[ "]/g),
    peeks: count(html, /class="quick-peek /g),
    chapters: chapters || "-",
    smart: count(html, /class="mcard mcard--grid/g),
    // Rendered placeholder pictures; the site menu's dropdown alone accounts for ~3 on every page.
    soon: count(html, /<img[^>]+src="\/assets\/coming-soon\.svg"/g),
    textCards: count(html, /mcard--text/g),
    trims: count(html, /class="mpick__trim"/g),
    equip: count(html, /class="mequip__group"/g),
    core: count(html, /class="mgroup"/g),
    gallery: html.includes('id="gallery"') ? "y" : "-",
    winter: html.includes('id="winter"') ? "y" : "-",
    similar: count(html, /class="msimilar__card"/g),
    savings: html.includes("savings-anchor") ? "y" : "-",
    preorder: html.includes("mnav__preorder") ? "y" : "-"
  });
}
console.table(rows);
