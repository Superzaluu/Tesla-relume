// Key numbers on rc-ev.com vs our spec sheets (models.specs). Read only: nothing is written anywhere.
// The dealer follows rc-ev.com (user, 2026-11-20), so a difference means our sheet should change
// (a migration file, never a direct write — see supabase/migrations/0014_rcev_specs.sql).
//
//   node --experimental-strip-types scripts/specs/compare-rcev.mts            all models
//   node --experimental-strip-types scripts/specs/compare-rcev.mts EC35-2 C9  some pages
//
// Needs SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (read from .env.local).

import { readFileSync } from "node:fs";
import { grid } from "./import-rcev.mts";

/** rc-ev.com page code → our model slug. EC75 / R5 cargo and passenger pages share one model. */
export const PAGE_TO_SLUG: Record<string, string> = {
  C5L: "c5l", C5QYZC: "c5-reev", C5CNGZC: "c5-cng", C5CD: "c5", C3: "c3", EC75PROHYB: "ec75pro-cargo", EC75PROKYB: "ec75pro-passenger",
  R5PROKYB: "r5pro-passenger", R5PROHYB: "r5pro-cargo", R5KYB: "r5", R5HYB: "r5", EC75KYB: "ec75", EC75HYB: "ec75", "EC35-2": "ec35",
  ED71S: "ed71s", EC31: "ec31", EC31L: "ec31l", EC31S: "ec31s", C9: "c9", "R5-FW": "r5-service", "C3-LC": "c3-cold", C5FSB: "c5-drone"
};
const KEYS: [string, RegExp][] = [
  ["size", /外形尺寸|长\*宽\*高/], ["wheelbase", /^轴距/], ["battery_kwh", /电池电量|电池容量/], ["range", /续航里程/],
  ["power", /^峰值功率|电动机总功率/], ["torque", /^峰值扭矩|电动机总扭矩/], ["top_speed", /最高车速/], ["dc_time", /快充时间/],
  ["cargo_size", /货箱尺寸/], ["cargo_volume", /载货容积/], ["payload", /额定载质量/], ["curb_weight", /整备质量/], ["seats", /座位数/]
];
const nums = (text: string) => [...new Set((text.replace(/,/g, "").match(/\d+(?:\.\d+)?/g) ?? []).map(Number))];

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).map((line) => line.match(/^\s*([A-Z_]+)=(.*)$/)).filter(Boolean).map((m) => [m![1], m![2].trim().replace(/^"|"$/g, "")]));
const res = await fetch(`${env.SUPABASE_URL}/rest/v1/models?select=slug,specs`, { headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY } });
const ours: Record<string, { configs: { name: string; sold: boolean }[]; values: Record<string, string[]> } | null> =
  Object.fromEntries(((await res.json()) as { slug: string; specs: any }[]).map((row) => [row.slug, row.specs]));

const pages = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGE_TO_SLUG);
let differences = 0;
for (const page of pages) {
  const slug = PAGE_TO_SLUG[page];
  // The site answers 500 to requests without browser-like Accept / Accept-Language headers.
  const response = await fetch(`https://www.rc-ev.com/cms/a/${page}.html`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", Accept: "text/html,application/xhtml+xml", "Accept-Language": "zh-CN,zh;q=0.9" }
  });
  if (!response.ok) { console.log(`\n## ${page}: rc-ev.com ${response.status} — алгаслаа`); continue; }
  const rows = grid(await response.text());
  const sheet = ours[slug];
  console.log(`\n## ${page} → ${slug}${sheet?.configs?.length ? "" : " (манайд хүснэгтгүй)"}`);
  for (const [key, label] of KEYS) {
    const theirs = rows.filter((row) => label.test(row[0])).flatMap((row) => row.slice(1)).join(" ");
    const mine = (sheet?.values?.[key] ?? []).filter(Boolean).join(" | ");
    if (!theirs || !mine) continue;
    const missing = nums(mine).filter((n) => !nums(theirs).includes(n));
    if (missing.length === 0) continue;
    differences++;
    console.log(`  ${key.padEnd(12)} rc-ev: ${theirs.slice(0, 120)}\n  ${"".padEnd(12)} манай: ${mine.slice(0, 120)}`);
  }
}
console.log(`\n${differences} зөрүү.`);
