"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { submitPreorder, type PreorderState } from "@/app/preorder/actions";
import { PAYMENTS, type PreorderModel } from "@/data/preorder";

const input =
  "w-full min-h-[46px] rounded-lg font-[inherit] border border-line bg-white px-3 py-2.5 text-regular text-ink outline-none transition focus:border-[#0f5a3a] focus:ring-2 focus:ring-[#0f5a3a]/15";
const label = "mb-1.5 block text-small font-semibold text-ink-secondary";

/** Pre-order form. The chosen model is shown with its photo so the visitor sees what they are ordering. */
export function PreorderForm({ models, initial }: { models: PreorderModel[]; initial: string }) {
  const [state, action, pending] = useActionState<PreorderState, FormData>(submitPreorder, {});
  const [value, setValue] = useState(initial);
  const [payment, setPayment] = useState<string>(PAYMENTS[0].value);
  const chosen = models.find((model) => model.value === value);
  const [slug, variant] = value.split("|");
  const loanHref = `/green-loan/${slug ? `?model=${encodeURIComponent(slug)}${variant ? `&variant=${variant}` : ""}` : ""}`;

  if (state.ok) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-8 text-center shadow-[0_10px_30px_rgb(15_35_56/.09)] md:p-12" role="status">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#eaf3ee] text-[28px] text-[#0f5a3a]" aria-hidden="true">✓</span>
        <h2 className="text-[26px] font-bold tracking-tight text-ink">Захиалга хүлээн авлаа</h2>
        <p className="mx-auto mt-2 max-w-[440px] text-regular text-ink-secondary">
          {chosen ? `${chosen.name}-ийн` : "Таны"} урьдчилсан захиалгыг бүртгэлээ. Манай зөвлөх тантай утсаар холбогдож нөхцөлийг тохирно.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link className="btn btn--tint px-6" href="/">Нүүр хуудас</Link>
          <Link className="btn btn--primary px-6" href="/#models">Бусад загвар үзэх</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <aside className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[0_10px_30px_rgb(15_35_56/.09)] lg:sticky lg:top-[calc(var(--navbar-height)+24px)]">
        {chosen ? (
          <>
            <img src={chosen.thumb} alt="" width={400} height={240} className="block aspect-[5/3] w-full bg-surface object-cover" />
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#147a48]">{chosen.category}</p>
              <p className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-ink">{chosen.name}</p>
              <p className="mt-1 text-small text-ink-secondary">{chosen.desc}</p>
            </div>
          </>
        ) : (
          <div className="grid aspect-[5/3] place-items-center bg-[#f3f7f5] p-6 text-center text-small text-ink-muted">Захиалах загвараа сонгоно уу.</div>
        )}
      </aside>

      <form action={action} className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[0_10px_30px_rgb(15_35_56/.09)] md:p-8" noValidate={false}>
        {/* Honeypot: hidden from people, bots fill it. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="po-model">Загвар</label>
            <select id="po-model" name="model" required className={input} value={value} onChange={(e) => setValue(e.target.value)}>
              <option value="">Загвараа сонгоно уу</option>
              {[...new Set(models.map((model) => model.category))].map((category) => (
                <optgroup key={category} label={category}>
                  {models.filter((model) => model.category === category).map((model) => (
                    <option key={model.value} value={model.value}>{model.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="po-name">Нэр</label>
            <input id="po-name" name="name" autoComplete="name" required minLength={2} maxLength={80} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="po-phone">Утас</label>
            <input id="po-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="[0-9+ \-]{8,20}" placeholder="9911 2233" className={input} />
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0 sm:col-span-2">
            <legend className={label}>Төлбөрийн хэлбэр</legend>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENTS.map((option, i) => (
                <label key={option.value} className="cursor-pointer">
                  <input type="radio" name="payment" value={option.value} required checked={payment === option.value} onChange={() => setPayment(option.value)} className="peer sr-only" />
                  <span className="flex min-h-[46px] items-center justify-center rounded-lg border border-line px-2 text-center text-small font-semibold text-ink-secondary transition hover:border-[#0f5a3a]/40 peer-checked:border-[#0f5a3a] peer-checked:bg-[#eaf3ee] peer-checked:text-[#0f5a3a] peer-focus-visible:ring-2 peer-focus-visible:ring-[#0f5a3a]/30">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            {payment === "green_loan" && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#eaf3ee] px-4 py-3">
                <p className="m-0 text-small text-[#123b2a]">
                  <strong>ХААН Банкны ногоон зээл</strong> · урьдчилгаа 10%-аас, 96 сар хүртэл. Сарын төлбөрөө тооцоолоод тооцоотойгоо хамт хүсэлт илгээх үү?
                </p>
                <Link href={loanHref} className="btn btn--primary btn--nav shrink-0 px-4">Тооцоолуур руу →</Link>
              </div>
            )}
          </fieldset>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="po-note">Тайлбар <span className="font-normal text-ink-muted">(заавал биш)</span></label>
            <textarea id="po-note" name="note" rows={4} maxLength={1000} placeholder="Өнгө, тохиргоо, тоо ширхэг эсвэл асуух зүйл" className={`${input} resize-y`} />
          </div>
        </div>

        {state.error && <p className="mt-4 rounded-lg bg-[#fdecec] px-4 py-3 text-small font-medium text-[#a32020]" role="alert">{state.error}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button className="btn btn--primary min-w-[220px] px-6" type="submit" disabled={pending}>
            {pending ? "Илгээж байна…" : "Захиалга илгээх"}
          </button>
          <p className="m-0 text-xs text-ink-muted">Илгээсний дараа манай зөвлөх тантай утсаар холбогдоно.</p>
        </div>
      </form>
    </div>
  );
}
