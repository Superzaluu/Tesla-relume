"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Img } from "@/data/types";
import { Picture } from "@/components/model/VariantValues";

export type SmartItem = { key: string; id?: string; title: string; tag?: string; text: string; image: Img };
export type SmartGroup = { label: string; items: SmartItem[] };

/**
 * «Аюулгүй ба ухаалаг» (variant A, user, 2026-11-20): driver assistance, safety and cabin as one grid of the same
 * picture cards (Similarity) instead of three sections with 7 + 3 + 2 cards. Pills filter by group; "Бүгд"
 * shows all. A link to a card (hero icon preview) switches back to "Бүгд" so the card is visible.
 */
export function SmartGrid({ groups }: { groups: SmartGroup[] }) {
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    const reset = () => setFilter("all");
    window.addEventListener("hashchange", reset);
    return () => window.removeEventListener("hashchange", reset);
  }, []);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const shown = groups.filter((group) => filter === "all" || group.label === filter);
  const items = shown.flatMap((group) => group.items);
  // No card alone on the last row (Closure): 12 → 4×3, 9 → 3×3, 2 → 2. When one would be left over with four
  // columns (5, 13, 17…), the first card takes 2×2, which fills the grid exactly (13 + 3 = 16 = 4×4).
  const n = items.length;
  const cols = n % 4 === 0 ? 4 : n % 3 === 0 ? 3 : n <= 2 ? n : 4;
  const featured = cols === 4 && n % 4 === 1 && n >= 5;

  return (
    <div className="msmart">
      {groups.length > 1 && (
        <div className="msmart__pills" role="group" aria-label="Шүүх">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Бүгд <span>{total}</span></button>
          {groups.map((group) => (
            <button type="button" key={group.label} aria-pressed={filter === group.label} onClick={() => setFilter(group.label)}>
              {group.label} <span>{group.items.length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="msmart__grid" style={{ "--cols": cols } as CSSProperties}>
        {items.map((item, i) => (
          <figure className={`mcard mcard--grid${featured && i === 0 ? " is-featured" : ""}`} key={item.key} id={item.id}>
            <Picture image={item.image} />
            <figcaption><h3>{item.title} {item.tag && <span>{item.tag}</span>}</h3><p>{item.text}</p></figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
