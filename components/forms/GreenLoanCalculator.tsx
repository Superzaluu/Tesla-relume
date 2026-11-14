"use client";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { submitGreenLoan, type GreenLoanState } from "@/app/green-loan/actions";
import {
  calculateLoan, INCOME_TYPES, MAX_TERM, MIN_DOWN_PERCENT, MIN_TERM, REAL_ESTATE_ABOVE, THIRD_PARTY_FEES, tugrik, type IncomeType
} from "@/data/greenLoan";
import type { PreorderModel } from "@/data/preorder";

const input =
  "w-full min-h-[46px] rounded-lg border border-line bg-white px-3 py-2.5 font-[inherit] text-regular text-ink outline-none transition focus:border-[#0f5a3a] focus:ring-2 focus:ring-[#0f5a3a]/15";
const label = "mb-1.5 block text-small font-semibold text-ink-secondary";
const card = "rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[0_10px_30px_rgb(15_35_56/.09)] md:p-8";
const TERM_CHIPS = [12, 24, 36, 48, 60, 72, 84, 96];

/** Green loan calculator; its values are sent with the request form below it. */
export function GreenLoanCalculator({ models, initial }: { models: PreorderModel[]; initial: string }) {
  const [state, action, pending] = useActionState<GreenLoanState, FormData>(submitGreenLoan, {});
  const [model, setModel] = useState(initial);
  const [priceText, setPriceText] = useState("");
  const [income, setIncome] = useState<IncomeType>("salary");
  const [downPercent, setDownPercent] = useState(20);
  const [months, setMonths] = useState(36);
  const [realEstate, setRealEstate] = useState(false);

  const price = Number(priceText.replace(/[^0-9]/g, "")) || 0;
  const maxTerm = MAX_TERM[income];
  const term = Math.min(months, maxTerm);
  const minDown = realEstate ? 0 : MIN_DOWN_PERCENT;
  const down = Math.max(minDown, downPercent);
  const result = useMemo(() => calculateLoan({ price, downPercent: down, months: term, income, realEstate }), [price, down, term, income, realEstate]);
  const chosen = models.find((item) => item.value === model);

  if (state.ok) {
    return (
      <div className={`${card} text-center md:p-12`} role="status">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#eaf3ee] text-[28px] text-[#0f5a3a]" aria-hidden="true">✓</span>
        <h2 className="text-[26px] font-bold tracking-tight text-ink">Хүсэлт хүлээн авлаа</h2>
        <p className="mx-auto mt-2 max-w-[460px] text-regular text-ink-secondary">
          Манай зөвлөх тантай утсаар холбогдож ногоон зээлийн бичиг баримт бүрдүүлэхэд тусална. Зээлийн эцсийн шийдвэрийг ХААН Банк гаргана.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link className="btn btn--tint px-6" href="/">Нүүр хуудас</Link>
          <Link className="btn btn--primary px-6" href="/#models">Бусад загвар үзэх</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
      <input type="hidden" name="downPercent" value={down} />
      <input type="hidden" name="months" value={term} />
      <input type="hidden" name="income" value={income} />

      {/* Inputs */}
      <section className={card} aria-labelledby="calc-title">
        <h2 id="calc-title" className="text-[22px] font-bold tracking-tight text-ink">Зээлийн тооцоолуур</h2>
        <p className="mb-6 mt-1 text-small text-ink-muted">Машины үнэ, урьдчилгаа, хугацаагаа оруулаад сарын төлбөрөө харна уу.</p>

        <div className="grid gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="gl-model">Загвар</label>
              <select id="gl-model" name="model" required className={input} value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="">Загвараа сонгоно уу</option>
                {[...new Set(models.map((item) => item.category))].map((category) => (
                  <optgroup key={category} label={category}>
                    {models.filter((item) => item.category === category).map((item) => <option key={item.value} value={item.value}>{item.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="gl-price">Машины үнэ (₮)</label>
              <input
                id="gl-price" name="price" inputMode="numeric" autoComplete="off" required placeholder="жишээ нь 85,000,000" className={input}
                value={price ? new Intl.NumberFormat("en-US").format(price) : ""}
                onChange={(e) => setPriceText(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              />
              <span className="mt-1 block text-xs text-ink-muted">Үнийг манай зөвлөхөөс лавлаж болно.</span>
            </div>
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={label}>Орлогын төрөл</legend>
            <div className="grid grid-cols-2 gap-2">
              {INCOME_TYPES.map((option) => (
                <button
                  key={option.value} type="button" aria-pressed={income === option.value} onClick={() => setIncome(option.value)}
                  className={`flex min-h-[54px] flex-col items-center justify-center rounded-lg border border-solid px-2 font-[inherit] transition ${income === option.value ? "border-[#0f5a3a] bg-[#eaf3ee] text-[#0f5a3a]" : "border-line bg-white text-ink-secondary hover:border-[#0f5a3a]/40"}`}
                >
                  <span className="text-small font-semibold">{option.label}</span>
                  <span className="text-xs opacity-75">{option.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label className="text-small font-semibold text-ink-secondary" htmlFor="gl-down">Урьдчилгаа</label>
              <span className="text-small font-bold text-ink">{down}%{price > 0 && <span className="ml-1 font-medium text-ink-muted">· {tugrik(result.downPayment)}</span>}</span>
            </div>
            <input id="gl-down" type="range" min={0} max={90} step={5} value={down} onChange={(e) => setDownPercent(Number(e.target.value))} className="w-full accent-[#0f5a3a]" />
            <label className="mt-2 flex items-start gap-2 text-small text-ink-secondary">
              <input type="checkbox" name="realEstate" checked={realEstate} onChange={(e) => setRealEstate(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0f5a3a]" />
              Үл хөдлөх хөрөнгө нэмж барьцаална (урьдчилгааг 0% хүртэл бууруулах боломжтой)
            </label>
            {!realEstate && downPercent < MIN_DOWN_PERCENT && <p className="mt-1 text-xs text-[#8a5a00]">Урьдчилгаа доод тал нь {MIN_DOWN_PERCENT}% байна.</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label className="text-small font-semibold text-ink-secondary" htmlFor="gl-term">Хугацаа</label>
              <span className="text-small font-bold text-ink">{term} сар <span className="font-medium text-ink-muted">· {(term / 12).toFixed(term % 12 ? 1 : 0)} жил</span></span>
            </div>
            <input id="gl-term" type="range" min={MIN_TERM} max={maxTerm} step={1} value={term} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-[#0f5a3a]" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TERM_CHIPS.filter((value) => value <= maxTerm).map((value) => (
                <button key={value} type="button" onClick={() => setMonths(value)}
                  className={`rounded-full border border-solid px-3 py-1 font-[inherit] text-xs font-semibold transition ${term === value ? "border-[#0f5a3a] bg-[#0f5a3a] text-white" : "border-line bg-white text-ink-secondary hover:border-[#0f5a3a]/40"}`}>
                  {value} сар
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Result + request */}
      <aside className="grid gap-6 lg:sticky lg:top-[calc(var(--navbar-height)+24px)]">
        <section className="rounded-[var(--radius-card)] bg-[#0f5a3a] p-6 text-white shadow-[0_14px_34px_rgb(15_90_58/.28)] md:p-8" aria-live="polite">
          <p className="m-0 text-small font-semibold text-white/75">Сарын төлбөр (ойролцоогоор)</p>
          <p className="m-0 mt-1 text-[clamp(32px,4vw,44px)] font-bold leading-tight tracking-tight">{price > 0 ? tugrik(result.monthly) : "—"}</p>
          <p className="m-0 mt-1 text-small text-white/75">Сарын хүү {result.rate.monthly}% · жилийн {result.rate.annual}%{chosen ? ` · ${chosen.name}` : ""}</p>
          <dl className="m-0 mt-5 grid gap-2 border-t border-white/20 pt-4 text-small">
            {[
              ["Зээлийн дүн", result.loan],
              ["Урьдчилгаа", result.downPayment],
              ["Нийт хүү", result.totalInterest],
              ["Нийт төлөх (зээл + хүү)", result.totalPaid],
              ["Зээл олгох шимтгэл (0.5%, 500,000₮ хүртэл)", result.serviceFee]
            ].map(([name, value]) => (
              <div key={name as string} className="flex justify-between gap-4">
                <dt className="text-white/75">{name}</dt>
                <dd className="m-0 text-right font-semibold">{price > 0 ? tugrik(value as number) : "—"}</dd>
              </div>
            ))}
          </dl>
          {result.needsRealEstate && (
            <p className="m-0 mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs text-white">Зээл {tugrik(REAL_ESTATE_ABOVE)}-өөс дээш тул үл хөдлөх хөрөнгө нэмж барьцаална.</p>
          )}
          <p className="m-0 mt-4 text-xs leading-relaxed text-white/65">
            Тэнцүү төлөлтөөр тооцсон ойролцоо дүн. Гуравдагч талын төлбөр: {THIRD_PARTY_FEES.map((fee) => `${fee.label.toLowerCase()} ${tugrik(fee.amount)}`).join(", ")}. Эцсийн нөхцөл, хуваарийг ХААН Банк тогтооно.
          </p>
        </section>

        <section className={card} aria-labelledby="req-title">
          <h2 id="req-title" className="text-[20px] font-bold tracking-tight text-ink">Зээлийн хүсэлт илгээх</h2>
          <p className="mb-5 mt-1 text-small text-ink-muted">Дээрх тооцоо хамт очно. Зөвлөх тантай холбогдож бичиг баримтад тусална.</p>
          <div className="grid gap-4">
            <div>
              <label className={label} htmlFor="gl-name">Нэр</label>
              <input id="gl-name" name="name" autoComplete="name" required minLength={2} maxLength={80} className={input} />
            </div>
            <div>
              <label className={label} htmlFor="gl-phone">Утас</label>
              <input id="gl-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="[0-9+ \-]{8,20}" placeholder="9911 2233" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="gl-note">Тайлбар <span className="font-normal text-ink-muted">(заавал биш)</span></label>
              <textarea id="gl-note" name="note" rows={3} maxLength={1000} placeholder="Асуух зүйл, холбогдох тохиромжтой цаг" className={`${input} resize-y`} />
            </div>
          </div>
          {state.error && <p className="mt-4 rounded-lg bg-[#fdecec] px-4 py-3 text-small font-medium text-[#a32020]" role="alert">{state.error}</p>}
          <button className="btn btn--primary mt-5 w-full" type="submit" disabled={pending}>{pending ? "Илгээж байна…" : "Хүсэлт илгээх"}</button>
          <p className="m-0 mt-3 text-center text-xs text-ink-muted">
            Бэлнээр эсвэл лизингээр авах уу?{" "}
            <Link href={`/preorder/${model ? `?model=${encodeURIComponent(model.split("|")[0])}${model.split("|")[1] ? `&variant=${model.split("|")[1]}` : ""}` : ""}`} className="font-semibold text-[#0f5a3a] underline underline-offset-2">
              Урьдчилсан захиалга өгөх
            </Link>
          </p>
        </section>
      </aside>
    </form>
  );
}
