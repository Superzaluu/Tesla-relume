// Server-only: reads files at build time (used from server components only).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Parses the machine-translated spec tables in src/data/specs/<slug>.txt
// (markdown-style "| a | b |" rows). Same rules as the old tools/build-site.ps1:
// drop Chinese retail-price rows, fix common translation mistakes, and turn
// rows without values into group headings.

const FIXES: [string, string][] = [
  ["Нүүр хуудасэлтүүлэг", "Гэрэлтүүлэг"], ["Нүүр хуудаслийн", "Гэрлийн"], ["Нүүр хуудасэл", "Гэрэл"], ["Нүүр хуудас", "Гэр"],
  ["Миль (км)", "Цэнэглэлтийн зай (км)"], ["Драйвын хэлбэр", "Хөтлөгчийн хэлбэр"], ["Драйверийн төрөл", "Хөтлөгчийн төрөл"],
  ["Хатуу жин", "Өөрийн жин"], ["Савны хэмжээ", "Тэвшний хэмжээ"], ["Савны өндөр", "Тэвшний өндөр"], ["Ванны", "Тэвшний"],
  ["аялалын зай", "явах зай"], ["үйл ажиллагааны миль", "ажлын явах зай"], ["Анхдагч", "Pioneer"], ["Rim", "Обуд"], ["\\*", "×"]
];

const fix = (text: string) => FIXES.reduce((value, [from, to]) => value.split(from).join(to), text).trim();

export type SpecRow =
  | { kind: "group"; label: string; span: number }
  | { kind: "row"; head: boolean; label: string; cells: { text: string; span?: number }[] };

export function readSpecTable(slug: string): SpecRow[] | null {
  const file = path.join(process.cwd(), "src", "data", "specs", `${slug}.txt`);
  if (!existsSync(file)) return null;

  const rows: string[][] = [];
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    for (const part of line.replace(/\|\|/g, "|\n|").split("\n")) {
      if (!part.startsWith("|")) continue;
      if (/^\|[\s\-|:]*$/.test(part)) continue; // empty or --- separator rows
      const cells = part.trim().replace(/^\|+|\|+$/g, "").split("|").map(fix);
      if (cells.length === 0) continue;
      if (/үнэ|юань/.test(cells[0])) continue; // Chinese retail prices
      const values = cells.slice(1).filter(Boolean);
      if (values.length > 0 && values.every((value) => /^\d{5,6}$/.test(value))) continue; // price-only rows
      rows.push(cells);
    }
  }
  if (rows.length === 0) return null;

  const max = Math.max(...rows.map((row) => row.length));
  let first = true;
  return rows.map((row): SpecRow => {
    if (row.slice(1).filter(Boolean).length === 0) return { kind: "group", label: row[0], span: max };
    const head = first;
    first = false;
    return {
      kind: "row", head, label: row[0],
      cells: row.slice(1).map((text, i) => (i === row.length - 2 && row.length < max ? { text, span: max - row.length + 1 } : { text }))
    };
  });
}
