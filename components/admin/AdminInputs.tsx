"use client";
// Interactive form pieces for /admin.
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "@/app/admin/actions";
import { inputClass } from "@/components/admin/styles";

export function SubmitButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`btn btn--primary px-6 disabled:opacity-60 ${className}`}>
      {pending ? "Хадгалж байна…" : children}
    </button>
  );
}

/** File picker with preview. Also sends the picked image's size as `<name>_width` / `<name>_height`. */
export function ImageField({ name, label, current, hint, required = false }: { name: string; label: string; current?: string | null; hint?: string; required?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const shown = preview ?? current ?? null;
  return (
    <div>
      <span className="mb-1 block text-small font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-28 w-44 items-center justify-center overflow-hidden rounded-lg border border-line bg-[#f5f7fa]">
          {shown ? <img src={shown} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-ink-muted">Зураггүй</span>}
        </div>
        <div className="min-w-0 flex-1">
          <input
            type="file" name={name} accept="image/jpeg,image/png,image/webp" required={required}
            className="block w-full text-small text-ink file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#e8f2ec] file:px-4 file:py-2 file:font-semibold file:text-[#0f5a3a]"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) { setPreview(null); setSize(null); return; }
              const url = URL.createObjectURL(file);
              setPreview(url);
              const img = new Image();
              img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight });
              img.src = url;
            }}
          />
          <p className="mt-1 text-xs text-ink-muted">{hint ?? "JPG, PNG эсвэл WebP, 4 MB хүртэл. Сонгохгүй бол одоогийн зураг хэвээр үлдэнэ."}</p>
          {size && <p className="mt-1 text-xs text-ink-muted">{size.w} × {size.h} px</p>}
        </div>
      </div>
      <input type="hidden" name={`${name}_width`} value={size?.w ?? ""} />
      <input type="hidden" name={`${name}_height`} value={size?.h ?? ""} />
    </div>
  );
}

export type StatDraft = { value: string; unit: string; label: string; note: string; pValue: string; pUnit: string; pLabel: string };

/** Editable list of key stats. With `variants`, each stat can have a different passenger value. */
export function StatsEditor({ initial, variants }: { initial: StatDraft[]; variants: boolean }) {
  const empty: StatDraft = { value: "", unit: "", label: "", note: "", pValue: "", pUnit: "", pLabel: "" };
  const [rows, setRows] = useState<StatDraft[]>(initial.length ? initial : [empty]);
  const update = (i: number, field: keyof StatDraft, value: string) =>
    setRows((current) => current.map((row, j) => (j === i ? { ...row, [field]: value } : row)));
  const move = (i: number, by: number) =>
    setRows((current) => {
      const next = [...current];
      const [row] = next.splice(i, 1);
      next.splice(Math.max(0, Math.min(next.length, i + by)), 0, row);
      return next;
    });

  return (
    <div>
      <input type="hidden" name="stats_json" value={JSON.stringify(rows)} />
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-line bg-[#fafbfc] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-muted">
                #{i + 1}{i < 3 ? " · карт дээр харагдана" : ""}
              </span>
              <span className="flex gap-1">
                <button type="button" className="rounded px-2 py-1 text-xs text-ink-muted hover:bg-white" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Дээш">↑</button>
                <button type="button" className="rounded px-2 py-1 text-xs text-ink-muted hover:bg-white" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Доош">↓</button>
                <button type="button" className="rounded px-2 py-1 text-xs text-[#b42318] hover:bg-white" onClick={() => setRows((current) => current.filter((_, j) => j !== i))}>Хасах</button>
              </span>
            </div>
            <div className="grid grid-cols-[1fr_1fr_2fr] gap-2">
              <input className={inputClass} placeholder="Утга (430)" value={row.value} onChange={(e) => update(i, "value", e.target.value)} />
              <input className={inputClass} placeholder="Нэгж (км)" value={row.unit} onChange={(e) => update(i, "unit", e.target.value)} />
              <input className={inputClass} placeholder="Тайлбар (Цэнэглэлтийн зай)" value={row.label} onChange={(e) => update(i, "label", e.target.value)} />
            </div>
            {variants && (
              <div className="mt-2 grid grid-cols-[1fr_1fr_2fr] gap-2">
                <input className={inputClass} placeholder="Зорчигчийн утга" value={row.pValue} onChange={(e) => update(i, "pValue", e.target.value)} />
                <input className={inputClass} placeholder="Зорчигчийн нэгж" value={row.pUnit} onChange={(e) => update(i, "pUnit", e.target.value)} />
                <input className={inputClass} placeholder="Зорчигчийн тайлбар" value={row.pLabel} onChange={(e) => update(i, "pLabel", e.target.value)} />
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--secondary mt-3 px-4" onClick={() => setRows((current) => [...current, empty])}>+ Үзүүлэлт нэмэх</button>
      {variants && <p className="mt-2 text-xs text-ink-muted">Зорчигчийн талбарыг хоосон орхивол ачааны хувилбартай ижил утга харагдана.</p>}
    </div>
  );
}

/** New card form: shows the new-model fields only when "+ Шинэ загвар" is chosen. */
export function ModelChoice({ models }: { models: { slug: string; name: string; description: string }[] }) {
  const [choice, setChoice] = useState("__new");
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-small font-semibold text-ink">Загвар</span>
        <select name="model_slug" className={inputClass} value={choice} onChange={(e) => setChoice(e.target.value)}>
          <option value="__new">+ Шинэ загвар үүсгэх</option>
          {models.map((model) => <option key={model.slug} value={model.slug}>{model.name} — {model.description}</option>)}
        </select>
      </label>
      {choice === "__new" && (
        <div className="grid gap-4 rounded-xl border border-dashed border-line p-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-small font-semibold text-ink">Нэр *</span>
            <input name="new_name" className={inputClass} placeholder="EC75 Max" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-small font-semibold text-ink">Хаяг (slug) *</span>
            <input name="new_slug" className={inputClass} placeholder="ec75-max" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
            <span className="mt-1 block text-xs text-ink-muted">Латин жижиг үсэг, тоо, зураас. Хуудасны хаяг: /models/ec75-max/</span>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-small font-semibold text-ink">Тайлбар *</span>
            <input name="new_description" className={inputClass} placeholder="Цахилгаан фургон" required />
          </label>
        </div>
      )}
    </div>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action] = useActionState(signIn, { error: initialError });
  return (
    <form action={action} className="space-y-4">
      {state.error && <p className="rounded-lg bg-[#fdecea] px-3 py-2 text-small text-[#b42318]">{state.error}</p>}
      <label className="block">
        <span className="mb-1 block text-small font-semibold text-ink">И-мэйл</span>
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-small font-semibold text-ink">Нууц үг</span>
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      <SubmitButton className="w-full">Нэвтрэх</SubmitButton>
    </form>
  );
}
