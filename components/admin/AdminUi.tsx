// Static layout pieces for /admin (server components).
import type { ReactNode } from "react";
import { inputClass } from "@/components/admin/styles";

export { inputClass };

export function Notice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p className="mb-6 rounded-lg bg-[#fdecea] px-4 py-3 text-small text-[#b42318]">{error}</p>;
  if (saved) return <p className="mb-6 rounded-lg bg-[#e8f2ec] px-4 py-3 text-small text-[#0f5a3a]">Хадгалагдлаа. Сайтад шууд шинэчлэгдсэн.</p>;
  return null;
}

export function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-[18px] font-bold text-ink">{title}</h2>
      {description && <p className="mt-1 text-small text-ink-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-small font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export function TextInput({ name, label, value, hint, placeholder, required, className }: {
  name: string; label: string; value?: string | number | null; hint?: string; placeholder?: string; required?: boolean; className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input name={name} defaultValue={value ?? ""} placeholder={placeholder} required={required} className={inputClass} />
    </Field>
  );
}

export function Select({ name, label, value, options, hint, className }: {
  name: string; label: string; value?: string | null; options: [value: string, label: string][]; hint?: string; className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select name={name} defaultValue={value ?? ""} className={inputClass}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </Field>
  );
}

export function Checkbox({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-small font-semibold text-ink">
      <input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4 accent-[#147a48]" />
      {label}
    </label>
  );
}

export const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-[#e8f2ec] text-[#0f5a3a]" : "bg-[#f1f2f4] text-ink-muted"}`}>
    {active ? "Харагдаж байна" : "Нуусан"}
  </span>
);
