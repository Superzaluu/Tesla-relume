"use client";
import { useState } from "react";
import type { Img } from "@/data/types";

type Item = { id: string; name: string; code: string; text: string; image: Img };

// Driver-assist feature list: selecting an item swaps the picture.
export function AdasTabs({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);
  return (
    <div className="adas">
      <div className="adas__media">
        {items.map((item) => (
          <img
            key={item.id} className={`adas__image${item.id === active ? " is-active" : ""}`}
            src={item.image.src as string} width={item.image.width} height={item.image.height} alt={item.image.alt as string} loading="lazy"
          />
        ))}
      </div>
      <div className="adas__list" role="tablist" aria-label="Туслах функцууд">
        {items.map((item) => (
          <button key={item.id} className={`adas__item${item.id === active ? " is-active" : ""}`} type="button" role="tab" aria-selected={item.id === active} onClick={() => setActive(item.id)}>
            <span className="adas__name">{item.name} <em>{item.code}</em></span>
            <span className="adas__desc">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
