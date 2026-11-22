"use client";
import { useMemo, useState } from "react";
import { FuelPriceTable, useOpenSavings } from "@/components/forms/SavingsCalculator";
import { calculateSavings, ELECTRICITY_PRICE, EXTENDER_FUEL_USE, type CalcModel, type FuelPrices } from "@/data/savings";
import { calculateLoan, INCOME_TYPES, MAX_TERM, MIN_DOWN_PERCENT, MIN_TERM, rateFor, type IncomeType } from "@/data/greenLoan";

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
function Card({ tone, label, value, note, share }: { tone: "diesel" | "ruichi" | "saving" | "loan" | "loanMain"; label: string; value: string; note: string; share: number }) {
  // Traffic-light colours (user's Figma, 2026-11-15): diesel red, Ruichi green, the saving yellow. Tinted
  // cards with the strong colour on the bar and the label, so text keeps its contrast; the saving card is
  // the solid one, as the figure the section is about. Each card is named in text, so red/green is never
  // the only cue (they are close for red-green colour blindness).
  const styles = {
    diesel: { box: "border-[#f3c4c4] bg-[#fdf2f2]", label: "text-[#b42318]", value: "text-ink", note: "text-ink-muted", track: "bg-[#f7dcdc]", bar: "bg-[#e5484d]" },
    ruichi: { box: "border-[#bcd7c7] bg-[#f3f9f5]", label: "text-[#0f5a3a]", value: "text-[#0f5a3a]", note: "text-ink-muted", track: "bg-[#e1efe6]", bar: "bg-[#1f8a57]" },
    saving: { box: "border-[#f0c53b] bg-[#ffd84d]", label: "text-[#6b4e00]", value: "text-ink", note: "text-[#5c4300]", track: "bg-white/50", bar: "bg-[#14213d]" },
    // Loan cards under them (user, 2026-11-21: "same design"): the monthly payment in the brand green, the
    // interest and yearly figures neutral, so the traffic-light colours above keep their meaning.
    loanMain: { box: "border-[#0f5a3a] bg-[#eef5f3]", label: "text-[#0f5a3a]", value: "text-[#0f5a3a]", note: "text-ink-muted", track: "bg-[#d9e9e0]", bar: "bg-[#0f5a3a]" },
    loan: { box: "border-line bg-[#f5f7fa]", label: "text-ink-secondary", value: "text-ink", note: "text-ink-muted", track: "bg-[#e4e9ef]", bar: "bg-[#667085]" }
  }[tone];
  return (
    <div className={`flex min-w-0 items-end justify-between gap-4 rounded-card border border-solid p-5 ${styles.box}`}>
      <div className="min-w-0">
        <p className={`m-0 text-tiny font-bold uppercase tracking-[.06em] ${styles.label}`}>{label}</p>
        <p className={`m-0 mt-2 text-[clamp(26px,2.4vw,33px)] font-bold leading-none tracking-tight tabular-nums ${styles.value}`}>{value}</p>
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
          {/* Folded on the homepage (user, 2026-11-21): title and line only, «Дэлгэрэнгүй» opens the calculator. */}
          <SavingsPanel models={models} fuelPrices={fuelPrices} idPrefix="teaser" collapsible />
        </div>
      </div>
    </section>
  );
}

// Starting values (user, 2026-11-21): 30% down, 54 months.
const LOAN_DOWN = 30, LOAN_TERM = 54;
/** "67,745,600" while typing → 67745600. */
const digits = (text: string) => Number(text.replace(/[^\d]/g, "")) || 0;

/**
 * «Зээлээр авбал» (user, 2026-11-21): Khan Bank's green vehicle loan on the model's price (its «Эхлэх үнэ»
 * when the card has one, else typed in), with the visitor's down payment, term and income type. Shows the
 * monthly payment, its average interest part and the yearly total, and how much of the payment the fuel
 * saving covers. Same annuity formula and rates as /green-loan/ (src/data/greenLoan.ts).
 */
export function LoanPart({ model, saving, idPrefix }: { model: CalcModel; saving: number; idPrefix: string }) {
  const [priceText, setPriceText] = useState(model.priceFrom ? model.priceFrom.toLocaleString("en-US") : "");
  const [down, setDown] = useState(LOAN_DOWN);
  const [income, setIncome] = useState<IncomeType>("salary");
  const [termChosen, setTerm] = useState(LOAN_TERM);
  const term = Math.min(termChosen, MAX_TERM[income]);
  const price = digits(priceText);
  const loan = price > 0 ? calculateLoan({ price, downPercent: down, months: term, income, realEstate: false }) : null;
  const interest = loan && term > 0 ? loan.totalInterest / term : 0;
  const covered = loan && loan.monthly > 0 ? Math.round((Math.max(0, saving) / loan.monthly) * 100) : 0;
  const id = (name: string) => `${idPrefix}-loan-${name}`;
  const label = "text-small font-semibold text-ink-secondary";

  const net = loan ? Math.max(0, saving) - loan.monthly : 0;
  // Bar scale: the bigger of the monthly payment and the monthly fuel saving (yearly: both × 12).
  const monthScale = Math.max(1, loan?.monthly ?? 0, saving);
  const rate = loan?.rate ?? rateFor(income, term);

  return (
    <div className="mt-3" aria-live="polite">
      {/* Results first, right under the cost cards (user, 2026-11-21); the settings follow below them. */}
      {/* Same cards as the costs above (user, 2026-11-21). Bars: the figure against the fuel saving of the same
          period, so a bar taller than the saving's shows the payment is bigger than what the fuel saves. */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card tone="loanMain" label="Сарын төлбөр" value={loan ? tugrik(loan.monthly) : "—"} note={loan ? `Зээл ${tugrik(loan.loan)}, ${term} сар` : "Машины үнээ доор оруулна уу"} share={loan ? loan.monthly / monthScale : 0} />
        <Card tone="loan" label="Сарын хүү (дунджаар)" value={loan ? tugrik(interest) : "—"} note={loan ? `Нийт хүү ${tugrik(loan.totalInterest)}` : "Сарын төлбөрийн хүүгийн хэсэг"} share={loan ? interest / monthScale : 0} />
        <Card tone="loan" label="Жилийн төлбөр" value={loan ? tugrik(loan.monthly * 12) : "—"} note={loan ? `Нийт төлөх ${tugrik(loan.totalPaid)}` : "12 сарын төлбөр"} share={loan ? (loan.monthly * 12) / (monthScale * 12) : 0} />
      </div>

      {/* The point of the block (user, 2026-11-21): what buying on the loan costs once the fuel saving is counted. */}
      {loan && loan.monthly > 0 && (
        <div className={`mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4 ${net >= 0 ? "bg-[#0f5a3a] text-white" : "border border-solid border-[#f0c53b] bg-[#fff8e1] text-ink"}`}>
          <p className="m-0 max-w-[60ch] text-small leading-relaxed">
            {net >= 0
              ? <>Түлшний хэмнэлт сарын зээлийн төлбөрийг <strong>бүрэн нөхөөд</strong> сард илүү үлдэнэ.</>
              : <>Түлшний хэмнэлт сарын төлбөрийн <strong>{covered}%</strong>-ийг нөхнө. Үлдсэнийг сар бүр нэмж төлнө.</>}
            {loan.needsRealEstate && " 150 сая ₮-өөс дээш зээлд үл хөдлөх хөрөнгө нэмэлт барьцаанд шаардлагатай."}
          </p>
          <p className="m-0 text-right">
            <span className={`block text-tiny font-bold uppercase tracking-[.06em] ${net >= 0 ? "text-white/80" : "text-[#6b4e00]"}`}>
              {net >= 0 ? "Зээл төлөөд сард үлдэх" : "Сард нэмж төлөх"}
            </span>
            <span className="block text-[26px] font-bold leading-tight tracking-tight tabular-nums">{tugrik(Math.abs(net))}</span>
            <span className={`block text-tiny ${net >= 0 ? "text-white/80" : "text-ink-muted"}`}>жилд {tugrik(Math.abs(net) * 12)}</span>
          </p>
        </div>
      )}

      <div className="mt-3 rounded-card border border-solid border-line bg-[#fafcfb] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="m-0 text-[16px] font-bold tracking-tight text-ink">Зээлийн нөхцөл</h3>
          <a className="text-tiny font-semibold text-[#0f5a3a] hover:underline" href={`/green-loan/?model=${encodeURIComponent(model.slug)}`}>Ногоон зээлийн дэлгэрэнгүй →</a>
        </div>
        <p className="m-0 mt-1 text-tiny text-ink-muted">
          Хаан банкны ногоон тээврийн хэрэгслийн зээл, сарын {rate.monthly}% (жилийн {rate.annual}%). Тэнцүү төлбөрөөр тооцсон ойролцоо дүн.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label} htmlFor={id("price")}>Машины үнэ (₮)</label>
            <input
              id={id("price")} inputMode="numeric" value={priceText} placeholder="Үнээ оруулна уу"
              onChange={(e) => { const n = digits(e.target.value); setPriceText(n ? n.toLocaleString("en-US") : ""); }}
              className="mt-1.5 w-full rounded-lg border border-solid border-line bg-white px-3 py-2 font-[inherit] text-regular tabular-nums text-ink focus:border-[#0f5a3a] focus:outline-none"
            />
            {model.priceFrom && <p className="m-0 mt-1 text-tiny text-ink-muted">Эхлэх үнэ: {tugrik(model.priceFrom)}</p>}
          </div>
          <div>
            <label className={label} htmlFor={id("down")}>Урьдчилгаа {down}%{loan ? ` · ${tugrik(loan.downPayment)}` : ""}</label>
            <input id={id("down")} type="range" min={MIN_DOWN_PERCENT} max={90} step={5} value={down} onChange={(e) => setDown(Number(e.target.value))} className="mt-3 w-full accent-[#0f5a3a]" />
          </div>
          <div>
            <label className={label} htmlFor={id("term")}>Хугацаа {term} сар</label>
            <input id={id("term")} type="range" min={MIN_TERM} max={MAX_TERM[income]} step={6} value={term} onChange={(e) => setTerm(Number(e.target.value))} className="mt-3 w-full accent-[#0f5a3a]" />
          </div>
          <div>
            <span className={label}>Орлого</span>
            <div className="mt-1.5 flex gap-1.5" role="group" aria-label="Орлогын төрөл">
              {INCOME_TYPES.map((type) => (
                <button
                  key={type.value} type="button" aria-pressed={income === type.value} onClick={() => setIncome(type.value)} title={type.hint}
                  className={`flex-1 cursor-pointer rounded-lg border border-solid px-2 py-2 font-[inherit] text-[13px] font-semibold ${income === type.value ? "border-[#0f5a3a] bg-[#0f5a3a] text-white" : "border-line bg-white text-ink hover:border-[#9cc4ad]"}`}
                >
                  {type.label.replace(" орлого", "")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The section's content, also shown as a window from «Хэмнэлтийн тооцоолуур» on model pages (user, 2026-11-20).
 * `own`: the one model to calculate for (the model page's own model; user, 2026-11-20), with no model chips.
 * `onDetail` runs before "Дэлгэрэнгүй тооцоолох" opens the full calculator (the window closes itself there).
 */
export function SavingsPanel({ models, fuelPrices, idPrefix, own, onDetail, collapsible = false }: {
  models: CalcModel[]; fuelPrices: FuelPrices; idPrefix: string; own?: CalcModel; onDetail?: () => void;
  /** Start folded to the title and line, with «Дэлгэрэнгүй» to open the rest (homepage section). */
  collapsible?: boolean;
}) {
  const [expanded] = useState(!collapsible);
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
          <p className="m-0 text-tiny font-bold uppercase tracking-[.08em] text-[#147a48]">Бизнесийн зардал хэмнэлт</p>
          <h2 id={`${idPrefix === "teaser" ? "savings-teaser" : `${idPrefix}-title`}`} className="m-0 mt-2 text-[clamp(26px,3vw,42px)] font-bold leading-tight tracking-tight text-ink">
            {/* The percentage in the brand green's complementary colour (user, 2026-11-21: «Complementary / эсрэгцсэн»
                — the opposite side of the colour wheel stands out most): brand #0f5a3a ≈ hue 154°, opposite ≈ 334°,
                hsl(334 70% 40%) = #ad1f5c, ≈6.7:1 on white. Was the saving card's darkened yellow #a16207. */}
            Түлшний зардлаа <span className="text-[#ad1f5c] tabular-nums">{percent}%</span> бууруулна
          </h2>
          <p className="m-0 mt-2 max-w-[62ch] text-regular text-ink-secondary">
            Өдөр бүр ажилладаг дизель машин болон {model.name}-ийн сар, жилийн зардлыг харьцуулаарай.
          </p>

          {!expanded ? (
            // The calculator is its own page since user test #1 (2026-11-23, item 6); the homepage links to it.
            <a href={`/savings/?model=${encodeURIComponent(model.slug)}${model.value.split("|")[1] ? `&variant=${model.value.split("|")[1]}` : ""}`} className="btn savings-cta mt-5 min-h-[44px] gap-1.5 px-5">
              <span className="savings-cta__icon" aria-hidden="true">₮</span>
              Хэмнэлтээ тооцоолох <span className="savings-cta__arrow" aria-hidden="true">→</span>
            </a>
          ) : (
          <div id={`${idPrefix}-body`}>

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
              <output htmlFor={km} className="text-[26px] font-bold tabular-nums text-[#0f5a3a]">{kmPerDay} км</output>
            </div>
            <input
              id={km} type="range" min={KM_MIN} max={kmMax} step={STEP} value={kmPerDay}
              onChange={(e) => setKmPerDay(Number(e.target.value))} className="mt-2 w-full accent-[#0f5a3a]"
            />
            {/* Stops at their own place on the slider; a click jumps there. */}
            <div className="relative mt-1 h-9 text-tiny text-ink-muted">
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

          {/* Right under the cost cards (user, 2026-11-21): the same model bought on the green loan — monthly
              payment, its interest part, the yearly total — and what is left of the fuel saving after paying it. */}
          <LoanPart key={model.value} model={model} saving={saving} idPrefix={idPrefix} />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 max-w-[70ch] text-tiny leading-relaxed text-ink-muted">
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
          </div>
          )}
        </>
  );
}
