"use client";
// «Хэмнэлтийн тооцоолуур» as its own page, /savings/ (user test #1, 2026-11-23, items 6 + 7). The quick window
// read as too wordy and people did not see that the km slider moves. Now: one question (km per day) with a
// hand that shows the slider can be dragged, then ONE big figure — the yearly saving — that counts up while
// coins drop into a pile, so the result feels like money won. Details (monthly costs, loan) stay folded below.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useOpenSavings, useSavingsData } from "@/components/forms/SavingsCalculator";
import { LoanPart } from "@/components/home/SavingsTeaser";
import { calTestDrive } from "@/components/ui/CalTestDrive";
import { LoadingLink } from "@/components/ui/LoadingLink";
import { brandName } from "@/data/brand";
import { calculateSavings, ELECTRICITY_PRICE, EXTENDER_FUEL_USE, type CalcModel } from "@/data/savings";

const DAYS = 26;
const KM_MIN = 20, KM_START = 80, STEP = 10, KM_CAP = 500, KM_FALLBACK = 300;
const maxKm = (model: CalcModel) => KM_MIN + Math.floor((Math.min(KM_CAP, model.rangeKm ?? KM_FALLBACK) - KM_MIN) / STEP) * STEP;
const tugrik = (v: number) => `${Math.round(v).toLocaleString("en-US")} ₮`;

/** The figure runs from its last value to the new one (ease-out, 0.8s), like a counter. */
function useCountUp(target: number) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now(), begin = from.current, span = target - begin;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 800);
      const value = begin + span * (1 - Math.pow(1 - t, 3));
      setShown(value);
      from.current = value;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return shown;
}

type Coin = { id: number; x: number; delay: number; spin: number; size: number };

/**
 * Coins that drop into the result card each time the figure settles (after the slider stops for 250ms).
 * More saving → more coins (6–18). Decorative only: the figure is in the text.
 */
function CoinRain({ amount }: { amount: number }) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const seq = useRef(0);
  useEffect(() => {
    if (amount <= 0) return;
    const timer = window.setTimeout(() => {
      const count = Math.max(6, Math.min(18, Math.round(amount / 1_000_000)));
      const batch = Array.from({ length: count }, (_, i): Coin => ({
        id: ++seq.current, x: 8 + Math.random() * 84, delay: i * 55 + Math.random() * 80, spin: Math.random() > 0.5 ? 1 : -1, size: 26 + Math.random() * 14
      }));
      setCoins(batch);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [amount]);
  return (
    <div className="scoin-rain" aria-hidden="true">
      {coins.map((coin) => (
        <span
          key={coin.id} className="scoin"
          style={{ left: `${coin.x}%`, width: coin.size, height: coin.size, animationDelay: `${coin.delay}ms`, "--spin": coin.spin } as CSSProperties}
        >₮</span>
      ))}
    </div>
  );
}

/** A coin stack that grows with the yearly saving (3–12 coins), sitting under the big figure. */
function CoinStack({ share }: { share: number }) {
  const n = Math.max(3, Math.min(12, Math.round(share * 12)));
  return (
    <div className="scoin-stack" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <span key={i} className="scoin scoin--flat" style={{ "--i": i } as CSSProperties} />)}
    </div>
  );
}

export function SavingsPage({ initial, extra }: { initial?: string; extra?: CalcModel }) {
  const data = useSavingsData();
  const openCalculator = useOpenSavings();
  const router = useRouter();
  const models = useMemo(() => {
    const list = data?.models ?? [];
    return extra && !list.some((m) => m.value === extra.value) ? [...list, extra] : list;
  }, [data, extra]);
  const [value, setValue] = useState(initial ?? "");
  const model = models.find((m) => m.value === value) ?? models.find((m) => m.slug === value.split("|")[0]) ?? models[0];
  const [kmChosen, setKm] = useState(KM_START);
  // The hand that drags the slider shows until the visitor touches it (user test #1, item 6).
  const [touched, setTouched] = useState(false);
  const [details, setDetails] = useState(false);

  if (!data || !model) return <div className="savings-page__empty">Тооцоолуурыг ачаалж байна…</div>;

  const kmMax = maxKm(model);
  const km = Math.min(kmChosen, kmMax);
  const run = (kmPerDay: number) => calculateSavings({
    model, compareFuel: model.compare.fuel, compareConsumption: model.compare.consumption,
    kmPerDay, daysPerMonth: DAYS, price: 0, downPercent: 0, months: 0, income: "salary"
  }, data.fuelPrices.prices);
  const now = run(km);
  const top = run(kmMax);
  const saving = Math.max(0, now.saving);
  const yearly = saving * 12;
  const percent = now.fuelCost > 0 ? Math.round((saving / now.fuelCost) * 100) : 0;
  const share = (km - KM_MIN) / (kmMax - KM_MIN);
  const [slug, variant] = model.value.split("|");
  const extender = model.fuel !== "BEV" && model.evRangeKm;

  const pick = (next: string) => {
    setValue(next);
    const [s, v] = next.split("|");
    router.replace(`/savings/?model=${encodeURIComponent(s)}${v ? `&variant=${v}` : ""}`, { scroll: false });
  };

  return (
    <div className="savings-page">
      <header className="savings-page__head">
        <p className="savings-page__kicker">Хэмнэлтийн тооцоолуур</p>
        <h1 className="savings-page__title">{brandName(model.name)}-аар хэр их хэмнэх вэ?</h1>
        <label className="savings-page__model">
          <span className="sr-only">Загвар</span>
          <select value={model.value} onChange={(e) => pick(e.target.value)}>
            {[...new Set(models.map((m) => m.category))].map((category) => (
              <optgroup key={category} label={category}>
                {models.filter((m) => m.category === category).map((m) => <option key={m.value} value={m.value}>{brandName(m.name)}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
      </header>

      {/* Step 1: the only question. */}
      <section className="savings-km" aria-labelledby="savings-km-label">
        <div className="savings-km__top">
          <label id="savings-km-label" htmlFor="savings-km">Өдөрт хэдэн км явдаг вэ?</label>
          <output htmlFor="savings-km" className="savings-km__value">{km}<small> км</small></output>
        </div>
        <div className={`savings-km__track${touched ? "" : " is-hinting"}`} style={{ "--share": share } as CSSProperties}>
          <input
            id="savings-km" type="range" min={KM_MIN} max={kmMax} step={STEP} value={km}
            onChange={(e) => { setKm(Number(e.target.value)); setTouched(true); }}
            onPointerDown={() => setTouched(true)} onKeyDown={() => setTouched(true)}
          />
          {!touched && (
            <span className="savings-km__hand" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40"><path d="M9 11.5V5a1.5 1.5 0 0 1 3 0v5.5M12 10V3.8a1.5 1.5 0 0 1 3 0V10M15 10V5.3a1.5 1.5 0 0 1 3 0v8.2c0 4.3-2.7 7-6.6 7-2.6 0-4.1-1.1-5.6-3.3L3.6 13a1.6 1.6 0 0 1 2.5-2l2.9 3" fill="#fff" stroke="#083d28" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          )}
        </div>
        <p className={`savings-km__hint${touched ? " is-hidden" : ""}`}>← Гулсуурыг хуруугаараа чирж өөрийн зайг тохируулаарай →</p>
        <div className="savings-km__stops">
          {[{ km: 40, label: "Хот дотор" }, { km: 150, label: "Түгээлт" }, { km: kmMax, label: model.fuel === "BEV" ? "Нэг цэнэгээр" : "Хот хооронд" }].map((stop) => (
            <button key={stop.label} type="button" aria-pressed={km === stop.km} onClick={() => { setKm(stop.km); setTouched(true); }}>
              <b>{stop.km} км</b> {stop.label}
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: the one big figure. */}
      <section className="savings-win" aria-live="polite">
        <CoinRain amount={yearly} />
        <p className="savings-win__label">Жилд хэмнэх мөнгө</p>
        <p className="savings-win__value"><CountUp value={yearly} /></p>
        <CoinStack share={top.saving > 0 ? yearly / (top.saving * 12) : 0} />
        <p className="savings-win__line">
          Сар бүр <b>{tugrik(saving)}</b> · түлшний зардал <b>{percent}%</b> буурна
        </p>
        <p className="savings-win__compare">
          <span className="is-diesel">Дизель машин: сард {tugrik(now.fuelCost)}</span>
          <span className="is-ruichi">{brandName(model.name)}: сард {tugrik(now.evCost)}</span>
        </p>
      </section>

      <div className="savings-page__actions">
        <LoadingLink className="btn btn--primary" href={`/preorder/?model=${encodeURIComponent(slug)}${variant ? `&variant=${variant}` : ""}`}>Урьдчилсан захиалга</LoadingLink>
        <button type="button" className="btn btn--secondary" {...calTestDrive}>Туршилтын жолоодлого</button>
        <button type="button" className="btn btn--tint" aria-expanded={details} onClick={() => setDetails(!details)}>
          {details ? "Зээлийн тооцоог хаах" : "Зээлээр авбал?"}
        </button>
      </div>

      {details && (
        <section className="savings-page__loan tw">
          <LoanPart key={model.value} model={model} saving={saving} idPrefix="savings-page" />
        </section>
      )}

      <p className="savings-page__note">
        Сард {DAYS} өдөр ажиллана гэж тооцов. {model.compare.name}: {model.compare.consumption} л/100 км, дизель {tugrik(data.fuelPrices.prices.dt)}/л
        ({data.fuelPrices.source === "benzin.mn" ? `benzin.mn, ${data.fuelPrices.asOf}` : `${data.fuelPrices.asOf}-ны үнэ`}). {brandName(model.name)}: {model.evConsumption} кВт·ц/100 км,
        цахилгаан {ELECTRICITY_PRICE}₮/кВт·ц{extender ? `, өдөрт ${model.evRangeKm} км-ээс илүүд бензин ${EXTENDER_FUEL_USE} л/100 км` : ""}.{" "}
        <button type="button" className="savings-page__more" onClick={() => openCalculator(slug, model)}>Өөрийн машинтай харьцуулах →</button>
      </p>
    </div>
  );
}

function CountUp({ value }: { value: number }) {
  const shown = useCountUp(value);
  return <>{tugrik(shown)}</>;
}
