"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MAX_TERM, tugrik, type IncomeType } from "@/data/greenLoan";
import {
  calculateSavings, COMPARE_VEHICLES, ELECTRICITY_PRICE, EXTENDER_FUEL_USE, FUEL_LABELS, SAVINGS_STORAGE_KEY, SERVICE_SAVING_PER_KM,
  type CalcModel, type FuelCode, type FuelPrices, type SavedVehicle
} from "@/data/savings";

// "Хэмнэлтийн тооцоолуур": the chosen Ruichi model against a similar combustion vehicle, with today's
// average fuel price, then the green loan payment, then what owning it really costs per month.
// The four steps hang on one line (Law of Uniform Connectedness) and update as the visitor types.

export { SAVINGS_STORAGE_KEY, type SavedVehicle };

const SavingsContext = createContext<(slug?: string) => void>(() => {});

/** Opens the calculator; on a model page pass its slug so that model is chosen. */
export function SavingsTrigger({ model }: { model?: string }) {
  const open = useContext(SavingsContext);
  return (
    <button type="button" className="btn btn--secondary saving-calculator__trigger" aria-haspopup="dialog" onClick={() => open(model)}>
      Хэмнэлтийн тооцоолуур
    </button>
  );
}

const field = "w-full min-h-[42px] rounded-lg border border-solid border-line bg-white px-3 py-2 font-[inherit] text-small text-ink outline-none focus:border-[#0f5a3a] focus:ring-2 focus:ring-[#0f5a3a]/15";
const label = "mb-1 block text-xs font-semibold text-ink-secondary";
const num = (value: string, fallback = 0) => {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function SavingsProvider({ children, models, fuelPrices }: { children: ReactNode; models: CalcModel[]; fuelPrices: FuelPrices }) {
  const [open, setOpen] = useState(false);
  const [modelValue, setModelValue] = useState(models[0]?.value ?? "");
  const [compareFuel, setCompareFuel] = useState<FuelCode>(models[0]?.compare.fuel ?? "dt");
  const [consumption, setConsumption] = useState(String(models[0]?.compare.consumption ?? 11));
  /** "similar" (the model's own comparison), a COMPARE_VEHICLES id, or "custom" (typed by the visitor). */
  const [compareChoice, setCompareChoice] = useState("similar");
  const [customName, setCustomName] = useState("");
  const [kmPerDay, setKmPerDay] = useState("80");
  const [days, setDays] = useState("26");
  const [priceText, setPriceText] = useState("");
  const [downPercent, setDownPercent] = useState(20);
  const [months, setMonths] = useState(36);
  const [income, setIncome] = useState<IncomeType>("salary");
  const lastFocus = useRef<HTMLElement | null>(null);
  const firstField = useRef<HTMLSelectElement>(null);
  const router = useRouter();

  const model = models.find((item) => item.value === modelValue) ?? models[0];
  const picked = COMPARE_VEHICLES.find((vehicle) => vehicle.id === compareChoice);
  const compareName = compareChoice === "custom" ? customName.trim() || "Өөрийн машин" : picked?.name ?? model?.compare.name ?? "";

  const choose = (value: string) => {
    const next = models.find((item) => item.value === value);
    setModelValue(value);
    // Only the automatic comparison follows the Ruichi model; a car the visitor picked stays.
    if (next && compareChoice === "similar") { setCompareFuel(next.compare.fuel); setConsumption(String(next.compare.consumption)); }
  };
  const chooseCompare = (choice: string) => {
    setCompareChoice(choice);
    const vehicle = COMPARE_VEHICLES.find((item) => item.id === choice);
    if (vehicle) { setCompareFuel(vehicle.fuel); setConsumption(String(vehicle.consumption)); }
    if (choice === "similar" && model) { setCompareFuel(model.compare.fuel); setConsumption(String(model.compare.consumption)); }
  };

  const show = (slug?: string) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    const match = slug ? models.find((item) => item.slug === slug) : undefined;
    if (match) choose(match.value);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    lastFocus.current?.focus();
  };

  useEffect(() => {
    document.body.classList.toggle("savings-modal-open", open);
    if (!open) return;
    firstField.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const price = num(priceText);
  const term = Math.min(months, MAX_TERM[income]);
  const result = useMemo(() => model ? calculateSavings({
    model, compareFuel, compareConsumption: num(consumption, model.compare.consumption), kmPerDay: num(kmPerDay), daysPerMonth: num(days),
    price, downPercent, months: term, income
  }, fuelPrices.prices) : null, [model, compareFuel, consumption, kmPerDay, days, price, downPercent, term, income, fuelPrices.prices]);

  const claimBonus = () => {
    if (!model) return;
    const saved: SavedVehicle = { model: model.name, compare: compareName, consumption, distance: kmPerDay };
    try { sessionStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(saved)); } catch { /* storage unavailable */ }
    setOpen(false);
    router.push("/register/");
  };

  const categories = [...new Set(models.map((item) => item.category))];

  return (
    <SavingsContext.Provider value={show}>
      {children}
      <div className="savings-modal" hidden={!open}>
        <div className="savings-modal__backdrop" onClick={close} />
        <section className="savings-modal__dialog savings-modal__dialog--flow tw" role="dialog" aria-modal="true" aria-labelledby="savings-title">
          <button className="savings-modal__close" type="button" aria-label="Хаах" onClick={close}>
            <img src="/assets/close.svg" width={20} height={20} alt="" />
          </button>
          <header className="mb-6 mr-11">
            <h2 className="m-0 text-[26px] font-bold leading-tight tracking-tight text-ink" id="savings-title">Хэмнэлтийн тооцоолуур</h2>
            <p className="m-0 mt-1 text-small text-ink-secondary">Ruichi-г ижил ангиллын шатахуунт машинтай харьцуулаад, ногоон зээлтэй бол сард бодит хэд гарахыг харна уу.</p>
            <FuelPriceTable fuelPrices={fuelPrices} selected={compareFuel} />
          </header>

          {open && model && result && (
            <ol className="relative m-0 list-none p-0">
              {/* The line that connects the four steps */}
              <span className="absolute bottom-8 left-[17px] top-4 w-0.5 bg-[#cfe1d7]" aria-hidden="true" />

              <Step n={1} title="Машин ба явалт">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={label} htmlFor="sv-model">Ruichi загвар</label>
                    <select id="sv-model" ref={firstField} className={field} value={model.value} onChange={(e) => choose(e.target.value)}>
                      {categories.map((category) => (
                        <optgroup key={category} label={category}>
                          {models.filter((item) => item.category === category).map((item) => <option key={item.value} value={item.value}>{item.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-lg bg-[#f3f7f5] px-3 py-3 sm:col-span-2">
                    <label className={label} htmlFor="sv-compare">Харьцуулах машин (одоогийн эсвэл авах гэж буй)</label>
                    <select id="sv-compare" className={field} value={compareChoice} onChange={(e) => chooseCompare(e.target.value)}>
                      <option value="similar">Төстэй: {model.compare.name} (санал болгож буй)</option>
                      {[...new Set(COMPARE_VEHICLES.map((vehicle) => vehicle.group))].map((group) => (
                        <optgroup key={group} label={group}>
                          {COMPARE_VEHICLES.filter((vehicle) => vehicle.group === group).map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
                        </optgroup>
                      ))}
                      <option value="custom">Өөр машин — гараар оруулах</option>
                    </select>
                    {compareChoice === "custom" && (
                      <div className="mt-2">
                        <label className={label} htmlFor="sv-custom">Машины нэр</label>
                        <input id="sv-custom" className={field} placeholder="жишээ нь Toyota Noah 2.0" maxLength={60} value={customName} onChange={(e) => setCustomName(e.target.value)} />
                      </div>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className={label} htmlFor="sv-fuel">Түлш</label>
                        <select id="sv-fuel" className={field} value={compareFuel} onChange={(e) => setCompareFuel(e.target.value as FuelCode)}>
                          {(Object.keys(FUEL_LABELS) as FuelCode[]).map((code) => <option key={code} value={code}>{FUEL_LABELS[code]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={label} htmlFor="sv-use">Зарцуулалт (л/100 км)</label>
                        <input id="sv-use" className={field} inputMode="decimal" value={consumption} onChange={(e) => setConsumption(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={label} htmlFor="sv-km">Өдөрт явах зай (км)</label>
                    <input id="sv-km" className={field} inputMode="numeric" value={kmPerDay} onChange={(e) => setKmPerDay(e.target.value)} />
                  </div>
                  <div>
                    <label className={label} htmlFor="sv-days">Сард ажиллах өдөр</label>
                    <input id="sv-days" className={field} inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} />
                  </div>
                </div>
              </Step>

              <Step n={2} title="Сарын зардал ба хэмнэлт" note={`${new Intl.NumberFormat("en-US").format(result.monthlyKm)} км/сар`}>
                <div className="grid grid-cols-2 gap-2">
                  <Figure label={`${compareName} · ${FUEL_LABELS[compareFuel]}`} value={tugrik(result.fuelCost)} />
                  <Figure label={`${model.name} · ${model.fuel === "BEV" ? "цахилгаан" : "цахилгаан + бензин"}`} value={tugrik(result.evCost)} />
                </div>
                <p className={`m-0 mt-3 rounded-lg px-3 py-2 text-small font-semibold ${result.saving >= 0 ? "bg-[#eaf3ee] text-[#0f5a3a]" : "bg-[#fff4d6] text-[#8a5a00]"}`}>
                  {result.saving >= 0 ? "Сард хэмнэнэ" : "Сард илүү зардал"}: {tugrik(Math.abs(result.saving))} · жилд {tugrik(Math.abs(result.saving) * 12)}
                </p>
              </Step>

              <Step n={3} title="Ногоон зээл" note="ХААН Банк">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="sv-price">Машины үнэ (₮)</label>
                    <input
                      id="sv-price" className={field} inputMode="numeric" placeholder="жишээ нь 85,000,000"
                      value={price ? new Intl.NumberFormat("en-US").format(price) : ""}
                      onChange={(e) => setPriceText(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                    />
                  </div>
                  <div>
                    <span className={label}>Орлого</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([["salary", "Цалин"], ["business", "Бизнес"]] as const).map(([value, text]) => (
                        <button key={value} type="button" aria-pressed={income === value} onClick={() => setIncome(value)}
                          className={`min-h-[42px] rounded-lg border border-solid font-[inherit] text-small font-semibold ${income === value ? "border-[#0f5a3a] bg-[#eaf3ee] text-[#0f5a3a]" : "border-line bg-white text-ink-secondary"}`}>
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={label} htmlFor="sv-down">Урьдчилгаа {downPercent}%</label>
                    <input id="sv-down" type="range" min={10} max={90} step={5} value={downPercent} onChange={(e) => setDownPercent(Number(e.target.value))} className="w-full accent-[#0f5a3a]" />
                  </div>
                  <div>
                    <label className={label} htmlFor="sv-term">Хугацаа {term} сар</label>
                    <input id="sv-term" type="range" min={12} max={MAX_TERM[income]} step={6} value={term} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-[#0f5a3a]" />
                  </div>
                </div>
                <p className="m-0 mt-3 text-small text-ink-secondary">
                  {result.loan
                    ? <>Сарын төлбөр <strong className="text-ink">{tugrik(result.loan.monthly)}</strong> · хүү {result.loan.rate.monthly}%/сар · урьдчилгаа {tugrik(result.loan.downPayment)}</>
                    : "Машины үнийг оруулбал зээлийн сарын төлбөр гарна. Үнийг манай зөвлөхөөс лавлаж болно."}
                </p>
              </Step>

              <Step n={4} title="Бодит зардал" last>
                {result.loan && result.ownCost !== null ? (
                  <div className="rounded-xl bg-[#0f5a3a] p-4 text-white">
                    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-2 text-center">
                      <Mini label="Зээлийн төлбөр" value={tugrik(result.loan.monthly)} />
                      <span className="pb-1 text-white/70">+</span>
                      <Mini label="Цэнэглэлт" value={tugrik(result.evCost)} />
                      <span className="pb-1 text-white/70">=</span>
                      <Mini label="Сард нийт" value={tugrik(result.ownCost)} strong />
                    </div>
                    <p className="m-0 mt-3 border-t border-solid border-white/20 pt-3 text-small">
                      Одоогийн машины түлш сард <strong>{tugrik(result.fuelCost)}</strong>.{" "}
                      {result.coverage !== null && result.saving > 0
                        ? <>Түлшний хэмнэлт зээлийн төлбөрийн <strong>{Math.round(result.coverage * 100)}%</strong>-ийг нөхнө{result.coverage >= 1 ? " — машин өөрийгөө төлнө." : "."}</>
                        : "Энэ явалтаар түлшний хэмнэлт гарахгүй байна."}
                    </p>
                    <p className="m-0 mt-1 text-xs text-white/70">Үүн дээр засвар үйлчилгээ жилд ≈ {tugrik(result.serviceSaving)} хэмнэнэ.</p>
                  </div>
                ) : (
                  <p className="m-0 rounded-lg border border-dashed border-line px-3 py-3 text-small text-ink-muted">
                    3-р алхамд машины үнийг оруулбал зээлийн төлбөр, цэнэглэлт, түлшний хэмнэлтийг нийлүүлж сарын бодит зардлыг харуулна.
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/green-loan/?model=${encodeURIComponent(model.slug)}`} onClick={() => setOpen(false)} className="btn btn--primary px-5">Ногоон зээлийн хүсэлт</Link>
                  <button type="button" onClick={claimBonus} className="btn btn--tint px-5">Бонус авах</button>
                </div>
              </Step>
            </ol>
          )}

          <p className="m-0 mt-4 text-xs leading-relaxed text-ink-muted">
            Шатахууны үнэ: {fuelPrices.source === "benzin.mn"
              ? <>{fuelPrices.companies.map((company) => company.label).join(", ")}-ийн Улаанбаатар дахь станцуудын дундаж (энгийн АИ-92-ыг оруулаагүй), benzin.mn, {fuelPrices.asOf}.</>
              : <>{fuelPrices.asOf}-ны дундаж (шинэ үнэ татаж чадсангүй).</>}{" "}
            Цахилгаан {ELECTRICITY_PRICE}₮/кВт·ц, {model?.name} {model?.evConsumption} кВт·ц/100 км{model && model.fuel !== "BEV" ? `, зай дуусахад бензин ${EXTENDER_FUEL_USE} л/100 км` : ""}.
            Засвар үйлчилгээ {SERVICE_SAVING_PER_KM}₮/км хэмнэлттэй гэж тооцов. Төстэй машины зарцуулалт ойролцоо утга — өөрийнхөөрөө засаж болно.
          </p>
        </section>
      </div>
    </SavingsContext.Provider>
  );
}

/** Today's fuel prices per company and the average used; the column of the chosen fuel is highlighted. */
function FuelPriceTable({ fuelPrices, selected }: { fuelPrices: FuelPrices; selected: FuelCode }) {
  const codes = Object.keys(FUEL_LABELS) as FuelCode[];
  const cell = (code: FuelCode) => `px-2 py-1.5 text-right tabular-nums ${code === selected ? "bg-[#eaf3ee] font-semibold text-[#0f5a3a]" : ""}`;
  const price = (value?: number) => (value ? new Intl.NumberFormat("en-US").format(value) : "—");
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-solid border-line bg-white">
      <table className="w-full min-w-[420px] border-collapse text-xs text-ink-secondary">
        <caption className="px-3 pb-1 pt-2.5 text-left text-xs font-semibold text-ink">
          Шатахууны үнэ, ₮/л <span className="font-normal text-ink-muted">· Улаанбаатар · {fuelPrices.asOf}{fuelPrices.source === "benzin.mn" ? " · benzin.mn" : " · сүүлд татсан үнэ"}</span>
        </caption>
        <thead>
          <tr className="border-0 border-b border-solid border-[#dfe7e3] text-ink-muted">
            <th className="px-3 py-1.5 text-left font-medium">Компани</th>
            {codes.map((code) => <th key={code} className={`${cell(code)} font-medium`}>{FUEL_LABELS[code]}</th>)}
          </tr>
        </thead>
        <tbody>
          {fuelPrices.companies.map((company) => (
            <tr key={company.label} className="border-0 border-b border-solid border-[#eef2f0]">
              <td className="px-3 py-1.5">{company.label}</td>
              {codes.map((code) => <td key={code} className={cell(code)}>{price(company.prices[code])}</td>)}
            </tr>
          ))}
          <tr className="text-ink">
            <td className="px-3 py-1.5 font-semibold">Дундаж (тооцоонд)</td>
            {codes.map((code) => <td key={code} className={`${cell(code)} font-bold`}>{price(fuelPrices.prices[code])}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Step({ n, title, note, last, children }: { n: number; title: string; note?: string; last?: boolean; children: ReactNode }) {
  return (
    <li className={`relative grid grid-cols-[36px_minmax(0,1fr)] gap-3 ${last ? "" : "pb-5"}`}>
      <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-[#0f5a3a] text-small font-bold text-white" aria-hidden="true">{n}</span>
      <div className="min-w-0 rounded-xl border border-solid border-line bg-white p-4">
        <h3 className="m-0 mb-3 flex items-baseline justify-between gap-2 text-[16px] font-bold text-ink">
          {title}{note && <span className="text-xs font-medium text-ink-muted">{note}</span>}
        </h3>
        {children}
      </div>
    </li>
  );
}

function Figure({ label: text, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-solid border-line px-3 py-2">
      <p className="m-0 truncate text-xs text-ink-muted">{text}</p>
      <p className="m-0 text-[18px] font-bold text-ink">{value}</p>
    </div>
  );
}

function Mini({ label: text, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-[11px] text-white/70">{text}</p>
      <p className={`m-0 font-bold ${strong ? "text-[17px]" : "text-small"}`}>{value}</p>
    </div>
  );
}
