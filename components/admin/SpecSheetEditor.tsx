"use client";
// Admin form for the structured spec sheet. Fixed rows (src/data/specSheet.ts), one column per
// configuration. Values are checked as you type; nothing blocks saving, but problems are coloured.
import { useMemo, useState } from "react";
import { inputClass } from "@/components/admin/styles";
import {
  checkValue, FIELDS, GROUPS, MARK_LABEL, MARKS, markOf, missingRequired, needsExtender,
  type ExtraRow, type Field, type Part, type SpecSheet
} from "@/data/specSheet";

type Props = { initial: SpecSheet; suggestions: Record<string, string[]>; fuel: string };

const TABS: { key: Part | "extras"; label: string }[] = [
  { key: "core", label: "1. Үндсэн үзүүлэлт" },
  { key: "equipment", label: "2. Тоноглол" },
  { key: "extras", label: "Нэмэлт мөр" }
];

const cellBorder = (level?: "warn" | "error") =>
  level === "error" ? " border-[#d92d20] bg-[#fef3f2]" : level === "warn" ? " border-[#f79009] bg-[#fffaeb]" : "";

export function SpecSheetEditor({ initial, suggestions, fuel }: Props) {
  const [sheet, setSheet] = useState<SpecSheet>(initial);
  const [tab, setTab] = useState<Part | "extras">("core");
  const [same, setSame] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FIELDS.map((field) => {
      const list = initial.values[field.key] ?? [];
      return [field.key, initial.configs.length > 1 && list.length > 0 && list.every((value) => value === list[0])];
    }))
  );
  const n = sheet.configs.length;
  const check = new Set(sheet.check ?? []);
  const missing = useMemo(() => missingRequired(sheet), [sheet]);
  const extender = needsExtender(fuel);

  const touch = (key: string, next: Partial<SpecSheet>) =>
    setSheet((current) => ({ ...current, ...next, check: (current.check ?? []).filter((item) => item !== key) }));
  const setValue = (field: Field, index: number | "all", value: string) => {
    const list = Array.from({ length: n }, (_, i) => sheet.values[field.key]?.[i] ?? "");
    const next = index === "all" ? list.map(() => value) : list.map((item, i) => (i === index ? value : item));
    touch(field.key, { values: { ...sheet.values, [field.key]: next } });
  };
  const setConfigs = (configs: SpecSheet["configs"], resize?: (list: string[]) => string[]) =>
    setSheet((current) => ({
      ...current,
      configs,
      values: resize ? Object.fromEntries(Object.entries(current.values).map(([key, list]) => [key, resize(list)])) : current.values,
      extras: resize ? current.extras.map((row) => ({ ...row, values: resize(row.values) })) : current.extras
    }));
  const setExtras = (extras: ExtraRow[]) => setSheet((current) => ({ ...current, extras }));

  const grid = { gridTemplateColumns: `minmax(220px,260px) 56px repeat(${n}, minmax(150px,1fr))` };
  const saved = JSON.stringify({ configs: sheet.configs, values: sheet.values, extras: sheet.extras, check: sheet.check ?? [], source: sheet.source });

  return (
    <div className="space-y-5">
      <input type="hidden" name="spec_sheet" value={saved} />

      {initial.converted && (
        <p className="rounded-xl border border-[#f79009]/40 bg-[#fffaeb] px-4 py-3 text-small text-ink">
          Хуучин хүснэгтээс автоматаар хөрвүүлсэн. <strong>Шалгах</strong> гэсэн мөрүүдийн багана тохиргоотойгоо таарахгүй байсан тул
          утгыг нь нягталж засна уу. Хадгалмагц энэ форм сайтын эх сурвалж болно.
        </p>
      )}
      {!initial.converted && initial.source && (
        <p className="rounded-xl border border-line bg-[#f3f7f5] px-4 py-3 text-small text-ink">
          Эх сурвалж: <strong>{initial.source}</strong>.
          {(sheet.check ?? []).length > 0 && <> <strong>Шалгах</strong> гэсэн {(sheet.check ?? []).length} мөрийг орчуулга, утгаар нь нягтална уу.</>}
        </p>
      )}
      {missing.length > 0 && (
        <div className="rounded-xl border border-[#f79009]/40 bg-[#fffaeb] px-4 py-3 text-small text-ink">
          <p className="m-0 font-semibold">Зарах тохиргоонд заавал байх тоноглол дутуу:</p>
          <ul className="m-0 mt-1 list-disc pl-5">
            {Object.entries(missing.reduce<Record<string, string[]>>((acc, item) => ((acc[item.config] ??= []).push(item.label), acc), {}))
              .map(([config, labels]) => <li key={config}><strong>{config}</strong>: {labels.join(", ")}</li>)}
          </ul>
          <p className="m-0 mt-1 text-xs text-ink-muted">Үнэхээр байхгүй бол тэр тохиргооны &quot;Зарна&quot;-г унтраавал сайтад харагдахгүй.</p>
        </div>
      )}

      {/* Configurations */}
      <div>
        <p className="mb-2 text-small font-semibold text-ink">Тохиргоо (багана)</p>
        <div className="flex flex-wrap gap-2">
          {sheet.configs.map((config, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-xl border border-solid border-line px-3 py-2 ${config.sold ? "bg-white" : "bg-[#f2f4f7] opacity-70"}`}>
              <input
                className={`${inputClass} w-48 py-1`} value={config.name} aria-label={`Тохиргоо ${i + 1}-ийн нэр`}
                onChange={(e) => setConfigs(sheet.configs.map((item, j) => (j === i ? { ...item, name: e.target.value } : item)))}
              />
              <label className="flex items-center gap-1 text-xs text-ink">
                <input type="checkbox" checked={config.sold} onChange={(e) => setConfigs(sheet.configs.map((item, j) => (j === i ? { ...item, sold: e.target.checked } : item)))} />
                Зарна
              </label>
              {n > 1 && (
                <button
                  type="button" className="rounded px-1 text-xs text-[#b42318] hover:bg-[#fef3f2]" aria-label={`${config.name} хасах`}
                  onClick={() => confirm(`"${config.name}" тохиргоог бүх утгатай нь хасах уу?`) && setConfigs(sheet.configs.filter((_, j) => j !== i), (list) => list.filter((_, j) => j !== i))}
                >✕</button>
              )}
            </div>
          ))}
          <button
            type="button" className="btn btn--secondary px-4"
            onClick={() => setConfigs([...sheet.configs, { name: `Тохиргоо ${n + 1}`, sold: true }], (list) => [...list, list[list.length - 1] ?? ""])}
          >+ Тохиргоо</button>
        </div>
        <p className="mt-1 text-xs text-ink-muted">&quot;Зарна&quot;-г унтраасан тохиргоо сайтад харагдахгүй. Шинэ тохиргоо сүүлийн баганын утгыг хуулж авна.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.key} type="button" role="tab" aria-selected={tab === item.key} onClick={() => setTab(item.key)}
            className={`rounded-full border border-solid px-4 py-2 text-small font-semibold ${tab === item.key ? "border-[#0f5a3a] bg-[#0f5a3a] text-white" : "border-line bg-white text-ink"}`}
          >
            {item.label}{item.key === "extras" ? ` (${sheet.extras.length})` : ""}
          </button>
        ))}
      </div>

      {tab !== "extras" ? (
        <div className="overflow-x-auto rounded-xl border border-solid border-line">
          <div className="min-w-max">
            <div className="grid items-center gap-2 border-0 border-b border-solid border-line bg-[#f5f7fa] px-3 py-2 text-xs font-semibold text-ink-muted" style={grid}>
              <span>Үзүүлэлт</span><span title="Бүх тохиргоонд ижил">Ижил</span>
              {sheet.configs.map((config, i) => <span key={i} className={config.sold ? "" : "opacity-50"}>{config.name}</span>)}
            </div>
            {GROUPS.filter((group) => group.part === tab).map((group) => (
              <div key={group.key}>
                <p className="m-0 bg-[#eaf3ee] px-3 py-2 text-small font-semibold text-[#0f5a3a]">
                  {group.label}{group.fuelOnly && !extender ? " — зөвхөн EREV/PHEV/CNG машинд харагдана" : ""}
                </p>
                {FIELDS.filter((field) => field.group === group.key).map((field) => {
                  const list = Array.from({ length: n }, (_, i) => sheet.values[field.key]?.[i] ?? "");
                  const isSame = same[field.key] && n > 1;
                  return (
                    <div key={field.key} className="grid items-start gap-2 border-0 border-b border-solid border-[#eef1f4] px-3 py-2" style={grid}>
                      <div className="pt-1.5 text-small text-ink">
                        {field.label}{field.unit ? <span className="text-ink-muted"> ({field.unit})</span> : null}
                        {field.required && <span className="ml-1 text-xs text-[#b54708]" title="Зарах тохиргоонд заавал байх">★</span>}
                        {field.hidden && <span className="ml-1 text-xs text-ink-muted">· сайтад харагдахгүй</span>}
                        {check.has(field.key) && (
                          <button type="button" className="ml-2 rounded bg-[#fffaeb] px-1.5 text-xs font-semibold text-[#b54708]" title="Багана таарахгүй байсан. Шалгаад дарна уу." onClick={() => touch(field.key, {})}>Шалгах ✓</button>
                        )}
                      </div>
                      <label className="flex justify-center pt-2">
                        <input
                          type="checkbox" checked={isSame} disabled={n < 2} aria-label={`${field.label}: бүх тохиргоонд ижил`}
                          onChange={(e) => { setSame({ ...same, [field.key]: e.target.checked }); if (e.target.checked) setValue(field, "all", list.find(Boolean) ?? ""); }}
                        />
                      </label>
                      {isSame ? (
                        <div style={{ gridColumn: `span ${n}` }}><Cell field={field} value={list[0]} suggestions={suggestions[field.key]} onChange={(value) => setValue(field, "all", value)} /></div>
                      ) : (
                        list.map((value, i) => (
                          <div key={i} className={sheet.configs[i].sold ? "" : "opacity-50"}>
                            <Cell field={field} value={value} suggestions={suggestions[field.key]} onChange={(next) => setValue(field, i, next)} />
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {FIELDS.map((field) => suggestions[field.key]?.length ? (
            <datalist id={`sg-${field.key}`} key={field.key}>{suggestions[field.key].map((value) => <option key={value} value={value} />)}</datalist>
          ) : null)}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="m-0 text-xs text-ink-muted">Стандарт жагсаалтад ороогүй мөрүүд. Бүтэн хүснэгтэд тухайн бүлгийн төгсгөлд харагдана.</p>
          {sheet.extras.map((row, r) => (
            <div key={r} className="rounded-xl border border-solid border-line bg-[#fafbfc] p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <input className={`${inputClass} max-w-xs`} value={row.label} aria-label="Мөрийн нэр" onChange={(e) => setExtras(sheet.extras.map((item, j) => (j === r ? { ...item, label: e.target.value } : item)))} />
                <select className={`${inputClass} w-auto`} value={row.group} aria-label="Бүлэг" onChange={(e) => setExtras(sheet.extras.map((item, j) => (j === r ? { ...item, group: e.target.value } : item)))}>
                  {GROUPS.map((group) => <option key={group.key} value={group.key}>{group.label}</option>)}
                </select>
                <button type="button" className="ml-auto rounded px-2 py-1 text-xs text-[#b42318] hover:bg-white" onClick={() => setExtras(sheet.extras.filter((_, j) => j !== r))}>Хасах</button>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(140px,1fr))` }}>
                {Array.from({ length: n }, (_, i) => (
                  <input
                    key={i} className={inputClass} value={row.values[i] ?? ""} placeholder={sheet.configs[i].name} aria-label={`${row.label} — ${sheet.configs[i].name}`}
                    onChange={(e) => setExtras(sheet.extras.map((item, j) => (j === r ? { ...item, values: Array.from({ length: n }, (_, k) => (k === i ? e.target.value : item.values[k] ?? "")) } : item)))}
                  />
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="btn btn--secondary px-4" onClick={() => setExtras([...sheet.extras, { group: "comfort", label: "", values: Array(n).fill("") }])}>+ Мөр нэмэх</button>
        </div>
      )}
    </div>
  );
}

function Cell({ field, value, suggestions, onChange }: { field: Field; value: string; suggestions?: string[]; onChange: (value: string) => void }) {
  const problem = checkValue(field, value);
  if (field.kind === "mark") {
    const sign = markOf(value);
    const note = sign ? value.slice(1).trim() : value;
    return (
      <div title={problem?.text}>
        <div className={`inline-flex overflow-hidden rounded-lg border border-solid ${problem ? "border-[#f79009]" : "border-line"}`} role="radiogroup" aria-label={field.label}>
          {MARKS.map((item) => (
            <button
              key={item} type="button" role="radio" aria-checked={sign === item} title={MARK_LABEL[item]}
              onClick={() => onChange(item === "–" ? "–" : note ? `${item} ${note}` : item)}
              className={`h-8 w-9 text-small ${sign === item ? "bg-[#0f5a3a] text-white" : "bg-white text-ink hover:bg-[#eaf3ee]"}`}
            >{item}</button>
          ))}
        </div>
        {sign !== "–" && (
          <input
            className={`${inputClass} mt-1 py-1 text-xs`} value={note} placeholder="тайлбар (заавал биш)"
            aria-label={`${field.label}: тайлбар`} onChange={(e) => onChange(`${sign || "●"}${e.target.value ? ` ${e.target.value}` : ""}`)}
          />
        )}
      </div>
    );
  }
  if (field.kind === "select" && field.options) {
    return (
      <select className={`${inputClass}${cellBorder(problem?.level)}`} value={value} onChange={(e) => onChange(e.target.value)} title={problem?.text}>
        <option value="">—</option>
        {!field.options.includes(value) && value && <option value={value}>⚠ {value}</option>}
        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }
  return (
    <div>
      <input
        className={`${inputClass}${cellBorder(problem?.level)}`} value={value} list={suggestions?.length ? `sg-${field.key}` : undefined}
        inputMode={field.kind === "number" ? "decimal" : undefined} placeholder={field.kind === "dims" ? "5130×1860×2020" : field.unit ?? ""}
        onChange={(e) => onChange(e.target.value)} aria-label={field.label} aria-invalid={problem?.level === "error" || undefined}
      />
      {problem && <p className={`m-0 mt-0.5 text-xs ${problem.level === "error" ? "text-[#b42318]" : "text-[#b54708]"}`}>{problem.text}</p>}
    </div>
  );
}
