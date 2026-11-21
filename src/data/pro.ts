// R5 / R5 Pro and EC75 / EC75 Pro on one page (user, 2026-11-21). Test visitors could not tell the two cards
// apart: the same body, size, cargo space and trims; only the battery (58.24 → 61.94 kWh), motor (70/100 → 130 kW),
// range and top speed differ. So each Pro is a power choice on its base model's page: its spec sheets join the
// base sheet (configs tagged with `power`), the picker shows «R5 | R5 Pro» side by side, its menu cards are
// hidden and its old URLs redirect to the base page. Supabase keeps the Pro rows (the sheets live there).
import type { SpecSheet } from "./specSheet";
import { isByVariant, pick, type Stat, type V, type Variant } from "./types";

export type ProMerge = { base: string; pro: string; cargo: string; passenger: string };

/** Base model slug → its Pro's names and slugs (one Pro row per side). */
export const PRO_MERGE: Record<string, ProMerge> = {
  r5: { base: "R5", pro: "R5 Pro", cargo: "r5pro-cargo", passenger: "r5pro-passenger" },
  ec75: { base: "EC75", pro: "EC75 Pro", cargo: "ec75pro-cargo", passenger: "ec75pro-passenger" }
};

/** Pro slug → the page it now lives on, and which side it opens. */
export const MERGED_INTO: Record<string, { slug: string; variant: Variant }> = Object.fromEntries(
  Object.entries(PRO_MERGE).flatMap(([slug, merge]) => [
    [merge.cargo, { slug, variant: "cargo" as const }],
    [merge.passenger, { slug, variant: "passenger" as const }]
  ])
);

/** The side prefix the base sheets use for their cargo / passenger trims (ConfigPicker SIDE). */
const SIDE: Record<Variant, string> = { cargo: "Ачааны · ", passenger: "Зорчигчийн · " };

/**
 * One sheet from the base sheet and its Pro sheets: the base configs first (power = base name), then the Pro
 * cargo and passenger configs with the side prefix the base uses. Every field and extra row gets one value
 * per configuration ("" where a sheet has no such row).
 */
export function mergeSheets(merge: ProMerge, base: SpecSheet, pro: Partial<Record<Variant, SpecSheet | null>>): SpecSheet {
  const parts: { sheet: SpecSheet; prefix: string; power: string }[] = [
    { sheet: base, prefix: "", power: merge.base },
    ...(["cargo", "passenger"] as const).flatMap((side) => {
      const sheet = pro[side];
      return sheet ? [{ sheet, prefix: SIDE[side], power: merge.pro }] : [];
    })
  ];
  const configs = parts.flatMap(({ sheet, prefix, power }) => sheet.configs.map((config) => ({ ...config, name: prefix + config.name, power })));
  const column = (part: (typeof parts)[number], read: (i: number) => string | undefined) => part.sheet.configs.map((_, i) => read(i) ?? "");

  const keys = [...new Set(parts.flatMap(({ sheet }) => Object.keys(sheet.values)))];
  const values = Object.fromEntries(keys.map((key) => [key, parts.flatMap((part) => column(part, (i) => part.sheet.values[key]?.[i]))]));

  const extraKeys = [...new Map(parts.flatMap(({ sheet }) => sheet.extras.map((row) => [`${row.group}|${row.label}`, row] as const))).values()];
  const extras = extraKeys.map(({ group, label }) => ({
    group, label,
    values: parts.flatMap((part) => {
      const row = part.sheet.extras.find((item) => item.group === group && item.label === label);
      return column(part, (i) => row?.values[i]);
    })
  }));

  return { configs, values, extras, source: parts.map(({ sheet }) => sheet.source).filter(Boolean).join(" + ") };
}

/** "401" and "420" → "401–420"; values without a number are left alone. */
function span(a: string, b: string | undefined) {
  const nums = [a, b ?? ""].flatMap((value) => (value.match(/\d+(?:\.\d+)?/g) ?? []).map(Number));
  if (!b || nums.length < 2) return a;
  const [min, max] = [Math.min(...nums), Math.max(...nums)];
  return min === max ? String(min) : `${min}–${max}`;
}

/**
 * The base page's key stats widened by the Pro's (cards, hero): "Туулах зай 401" + Pro "420" → "401–420".
 * Each side takes its own Pro row; a stat the Pro does not have (fast charge) stays as it is.
 */
export function widenStats(stats: Stat[], pro: Partial<Record<Variant, Stat[] | undefined>>): Stat[] {
  return stats.map((stat) => {
    const sides = (["cargo", "passenger"] as const).map((side) => {
      const label = pick(stat.label, side);
      const match = pro[side]?.find((item) => pick(item.label, side) === label);
      return span(pick(stat.value, side), match && pick(match.value, side));
    });
    const value: V<string> = sides[0] === sides[1] && !isByVariant(stat.value) ? sides[0] : { cargo: sides[0], passenger: sides[1] };
    return { ...stat, value };
  });
}
