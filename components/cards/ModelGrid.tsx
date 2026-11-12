"use client";
import { useState } from "react";
import { ModelSpecCard, type ModelCardData } from "@/components/cards/ModelSpecCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

/** Homepage "Бүх загвар": category filter + grid of model cards. */
export function ModelGrid({ cards, categories }: { cards: ModelCardData[]; categories: { id: string; label: string }[] }) {
  const [active, setActive] = useState("all");
  const visible = active === "all" ? cards : cards.filter((card) => card.categoryId === active);
  const chips = [{ id: "all", label: "Бүгд" }, ...categories];

  return (
    <section className="section" id="models">
      <div className="container container--gap-80">
        <SectionTitle title="Бүх загвар" text="Таны хэрэгцээнд тохирох цахилгаан автомашинаа сонгоорой" />
        <div className="tw">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ангиллаар шүүх">
            {chips.map((chip) => {
              const on = chip.id === active;
              const count = chip.id === "all" ? cards.length : cards.filter((c) => c.categoryId === chip.id).length;
              return (
                <button
                  key={chip.id} type="button" aria-pressed={on} onClick={() => setActive(chip.id)}
                  className={`rounded-full border px-4 py-2 text-small font-semibold transition-colors ${on ? "border-[#0f5a3a] bg-[#0f5a3a] text-white" : "border-line bg-white text-ink-secondary hover:border-[#0f5a3a] hover:text-[#0f5a3a]"}`}
                >
                  {chip.label} <span className={on ? "text-white/70" : "text-ink-muted"}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((card) => <ModelSpecCard model={card} key={card.key} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
