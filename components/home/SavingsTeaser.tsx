"use client";
import { useMemo, useState } from "react";
import { FuelPriceTable, useOpenSavings } from "@/components/forms/SavingsCalculator";
import { calculateSavings, ELECTRICITY_PRICE, EXTENDER_FUEL_USE, type CalcModel, type FuelPrices } from "@/data/savings";

// Fuel-cost section right under the hero (user, 2026-11-15; reference: a "business profit calculator" with a
// km slider and three result cards). One model and the visitor's km per day give three figures: the diesel
// vehicle's monthly fuel, the Ruichi's monthly charging, and the yearly saving. Each card has a bar on a fixed
// scale (the figure at the slider's maximum), so the bars rise and fall as the slider moves. Same formula,
// models and today's fuel prices as the full calculator, which "Дэлгэрэнгүй тооцоолох" opens.
// Menu entries as "slug|variant": EC75 / R5 hold their Pro since 2026-11-21 (src/data/pro.ts), whose cards are gone.
const MODELS = ["ec75|cargo", "r5|passenger", "c5-reev|", "c3|", "ed71s|"];
const DAYS = 26;
const KM_MIN = 20, KM_START = 80, STEP = 10;
// The slider ends at the chosen model's range (user, 2026-11-15): 420 km for EC75 Pro / R5 Pro, 327 for C3,
// 313 for ED71S; never above 500 (C5 EREV's 1,200 km total would make the useful part of the slider tiny).
const KM_CAP = 500, KM_FALLBACK = 300;
// Rounded down to the slider step so its end is reachable (327 → 320, 313 → 310).
const maxKm = (model: CalcModel) => {
  const limit = Math.min(KM_CAP, model.rangeKm ?? KM_FALLBACK);
  return KM_MIN + Math.floor((limit - KM_MIN) / STEP) * STEP;
};

const tugrik = (v: number) => `${Math.round(v).toLocaleString("en-US")} ₮`;

function costs(model: CalcModel, kmPerDay: number, prices: FuelPrices["prices"]) {
  return calculateSavings({
    model, compareFuel: model.compare.fuel, compareConsumption: model.compare.consumption,
    kmPerDay, daysPerMonth: DAYS, price: 0, downPercent: 0, months: 0, income: "salary"
  }, prices);
}

/** A result card: label, figure, note, and a bar whose height is value / max. */
function Card({ tone, label, value, note, share }: { tone: "diesel" | "ruichi" | "saving"; label: string; value: string; note: string; share: number }) {
  // Traffic-light colours (user's Figma, 2026-11-15): diesel red, Ruichi green, the saving yellow. Tinted
  // cards with the strong colour on the bar and the label, so text keeps its contrast; the saving card is
  // the solid one, as the figure the section is about. Each card is named in text, so red/green is never
  // the only cue (they are close for red-green colour blindness).
  const styles = {
    diesel: { box: "border-[#f3c4c4] bg-[#fdf2f2]", label: "text-[#b42318]", value: "text-ink", note: "text-ink-muted", track: "bg-[#f7dcdc]", bar: "bg-[#e5484d]" },
    ruichi: { box: "border-[#bcd7c7] bg-[#f3f9f5]", label: "text-[#0f5a3a]", value: "text-[#0f5a3a]", note: "text-ink-muted", track: "bg-[#e1efe6]", bar: "bg-[#1f8a57]" },
    saving: { box: "border-[#f0c53b] bg-[#ffd84d]", label: "text-[#6b4e00]", value: "text-ink", note: "text-[#5c4300]", track: "bg-white/50", bar: "bg-[#14213d]" }
  }[tone];
  return (
    <div className={`flex min-w-0 items-end justify-between gap-4 rounded-card border border-solid p-5 ${styles.box}`}>
      <div className="min-w-0">
        <p className={`m-0 text-xs font-bold uppercase tracking-[.06em] ${styles.label}`}>{label}</p>
        <p className={`m-0 mt-2 text-[clamp(24px,2.6vw,32px)] font-bold leading-none tracking-tight tabular-nums ${styles.value}`}>{value}</p>
        <p className={`m-0 mt-2 text-small ${styles.note}`}>{note}</p>
      </div>
      {/* Bar on a fixed scale: rises and falls with the km slider. The figure is in the text, so it is hidden. */}
      <div className={`relative h-[112px] w-[34px] shrink-0 overflow-hidden rounded-md ${styles.track}`} aria-hidden="true">
        <span
          className={`absolute inset-x-0 bottom-0 rounded-t-md ${styles.bar} transition-[height] duration-300 ease-out motion-reduce:transition-none`}
          style={{ height: `${Math.max(3, Math.min(100, share * 100))}%` }}
        />
      </div>
    </div>
  );
}

export function SavingsTeaser({ models, fuelPrices }: { models: CalcModel[]; fuelPrices: FuelPrices }) {
  return (
    <section className="section" aria-labelledby="savings-teaser">
      <div className="container">
        <div className="tw rounded-card border border-solid border-line bg-white p-5 shadow-[0_10px_30px_rgb(15_35_56/.06)] sm:p-8">
          <SavingsPanel models={models} fuelPrices={fuelPrices} idPrefix="teaser" />
        </div>
      </div>
    </section>
  );
}

/**
 * The section's content, also shown as a window from «Хэмнэлтийн тооцоолуур» on model pages (user, 2026-11-20).
 * `own`: the one model to calculate for (the model page's own model; user, 2026-11-20), with no model chips.
 * `onDetail` runs before "Дэлгэрэнгүй тооцоолох" opens the full calculator (the window closes itself there).
 */
export function SavingsPanel({ models, fuelPrices, idPrefix, own, onDetail }: {
  models: CalcModel[]; fuelPrices: FuelPrices; idPrefix: string; own?: CalcModel; onDetail?: () => void;
}) {
  const openCalculator = useOpenSavings();
  const choices = useMemo(
    () => (own ? [own] : MODELS.map((value) => models.find((m) => m.value === value)).filter((m): m is CalcModel => Boolean(m))),
    [models, own]
  );
  const [index, setIndex] = useState(0);
  const [kmChosen, setKmPerDay] = useState(KM_START);
  const model = choices[index] ?? choices[0];
  if (!model) return null;

  const kmMax = maxKm(model);
  // Switching to a model with a shorter range keeps the chosen km within that range.
  const kmPerDay = Math.min(kmChosen, kmMax);
  const stopLeft = (km: number) => `${((km - KM_MIN) / (kmMax - KM_MIN)) * 100}%`;
  const stops = [
    { km: 40, label: "Хот дотор" },
    { km: 150, label: "Идэвхтэй түгээлт" },
    { km: kmMax, label: model.fuel === "BEV" ? "Нэг цэнэглэлтээр" : "Хот хооронд" }
  ];

  const now = costs(model, kmPerDay, fuelPrices.prices);
  const atMax = costs(model, kmMax, fuelPrices.prices);
  const saving = Math.max(0, now.saving);
  const percent = now.fuelCost > 0 ? Math.round((saving / now.fuelCost) * 100) : 0;
  const extender = model.fuel !== "BEV" && model.evRangeKm;

  const km = `${idPrefix}-km`;
  return (
        <>
          <p className="m-0 text-xs font-bold uppercase tracking-[.08em] text-[#147a48]">Бизнесийн зардал хэмнэлт</p>
          <h2 id={`${idPrefix === "teaser" ? "savings-teaser" : `${idPrefix}-title`}`} className="m-0 mt-2 text-[clamp(26px,3.2vw,40px)] font-bold leading-tight tracking-tight text-ink">
            {/* The percentage in the saving card's yellow, darkened to stay readable on white (≈4.9:1). */}
            Түлшний зардлаа <span className="text-[#a16207] tabular-nums">{percent}%</span> бууруулна
          </h2>
          <p className="m-0 mt-2 max-w-[62ch] text-regular text-ink-secondary">
            Өдөр бүр ажилладаг дизель машин болон {model.name}-ийн сар, жилийн зардлыг харьцуулаарай.
          </p>

          {choices.length > 1 && <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Загвар">
            {choices.map((m, i) => (
              <button
                key={m.value} type="button" aria-pressed={i === index} onClick={() => setIndex(i)}
                className={`cursor-pointer rounded-full border border-solid px-3.5 py-2 font-[inherit] text-[13.5px] font-semibold ${i === index ? "border-[#0f5a3a] bg-[#0f5a3a] text-white" : "border-line bg-white text-ink hover:border-[#9cc4ad]"}`}
              >
                {m.name}
              </button>
            ))}
          </div>}

          <div className="mt-5 rounded-card border border-solid border-line bg-[#fafcfb] px-5 pb-4 pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={km} className="text-small font-semibold text-ink-secondary">Өдөрт явах дундаж зай</label>
              <output htmlFor={km} className="text-[24px] font-bold tabular-nums text-[#0f5a3a]">{kmPerDay} км</output>
            </div>
            <input
              id={km} type="range" min={KM_MIN} max={kmMax} step={STEP} value={kmPerDay}
              onChange={(e) => setKmPerDay(Number(e.target.value))} className="mt-2 w-full accent-[#0f5a3a]"
            />
            {/* Stops at their own place on the slider; a click jumps there. */}
            <div className="relative mt-1 h-9 text-xs text-ink-muted">
              {stops.map((stop, i) => (
                <button
                  key={stop.km} type="button" onClick={() => setKmPerDay(stop.km)}
                  className={`absolute top-0 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 font-[inherit] text-ink-muted hover:text-[#0f5a3a] ${i === 0 ? "text-left" : i === stops.length - 1 ? "-translate-x-full text-right" : "-translate-x-1/2 text-center"}`}
                  style={{ left: stopLeft(stop.km) }}
                >
                  <span className="block font-semibold tabular-nums">{stop.km} км</span>
                  <span className="hidden sm:block">{stop.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3" aria-live="polite">
            <Card
              tone="diesel" label="Дизель машин" value={tugrik(now.fuelCost)}
              note={`Сарын түлш · ${model.compare.name}`} share={now.fuelCost / atMax.fuelCost}
            />
            <Card
              tone="ruichi" label={`${model.name} ${extender ? "зай сунгагчтай" : "цахилгаан"}`} value={tugrik(now.evCost)}
              note={extender ? "Сарын цэнэг ба бензин" : "Сарын цэнэгийн зардал"} share={now.evCost / atMax.fuelCost}
            />
            <Card
              tone="saving" label="Жилийн цэвэр хэмнэлт" value={tugrik(saving * 12)}
              note={`Сар бүр ${tugrik(saving)} хэмнэнэ`} share={(saving * 12) / Math.max(1, atMax.saving * 12)}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 max-w-[70ch] text-xs leading-relaxed text-ink-muted">
              Сард {DAYS} өдөр. {model.compare.name}: {model.compare.consumption} л/100 км, дизель {tugrik(fuelPrices.prices.dt)}/л
              ({fuelPrices.source === "benzin.mn" ? `benzin.mn, ${fuelPrices.asOf}` : `${fuelPrices.asOf}-ны үнэ`}). {model.name}: {model.evConsumption} кВт·ц/100 км,
              цахилгаан {ELECTRICITY_PRICE}₮/кВт·ц{extender ? `, өдөрт ${model.evRangeKm} км-ээс илүүд бензин ${EXTENDER_FUEL_USE} л/100 км` : ""}. Зөвхөн түлш, цэнэгийн зардал.
            </p>
            <button type="button" className="btn btn--primary min-h-[42px] px-5" onClick={() => { onDetail?.(); openCalculator(model.slug, own); }}>Дэлгэрэнгүй тооцоолох</button>
          </div>
          <details className="mt-3 text-small">
            <summary className="cursor-pointer font-semibold text-[#0f5a3a]">Өнөөдрийн шатахууны үнэ</summary>
            <FuelPriceTable fuelPrices={fuelPrices} selected={model.compare.fuel} />
          </details>
        </>
  );
}
