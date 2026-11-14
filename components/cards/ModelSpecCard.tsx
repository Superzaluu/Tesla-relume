import Link from "next/link";
import { hasEngine, type QuickSpecs } from "@/data/types";
import { compactSize, countOnly, payloadValue, QuickIcon } from "@/components/ui/QuickSpecs";

export type ModelCardData = {
  key: string;
  href: string;
  /** Pre-order page with this card's model and variant chosen. */
  preorderHref: string;
  thumb: string;
  name: string;
  desc: string;
  categoryId: string;
  category: string;
  stats: { value: string; unit: string; label: string }[];
  quick?: QuickSpecs;
};

// The card has room for one-line stat labels only; the model page keeps the full wording.
const SHORT_LABELS: [RegExp, string][] = [
  [/^Цэнэглэлтийн зай/, "Зай"], // "Цэнэглэлтийн зай (CLTC)" → "Зай (CLTC)"
  [/^Хурдан цэнэглэлт.*/, "Цэнэглэлт"], // "Хурдан цэнэглэлт 20–80%" → "Цэнэглэлт" (20–80% stays on the model page)
  [/^Нийт явах зай/, "Нийт зай"],
  [/^Ажлын явах зай/, "Ажлын зай"],
  [/^Цэвэр цахилгаанаар/, "Цахилгаанаар"],
  [/^Зайн багтаамж/, "Батерей"]
];
const shortStatLabel = (label: string) => SHORT_LABELS.reduce((text, [pattern, short]) => text.replace(pattern, short), label);
/** "км хүртэл" → "км": "up to" adds a line without changing the number. */
const shortStatUnit = (unit: string) => unit.replace(/\s*хүртэл$/, "");

const FUEL_NAMES: Record<QuickSpecs["fuel"], string> = { BEV: "Цахилгаан", EREV: "Зай сунгагчтай", PHEV: "Хайбрид" };

/** Model card with photo, key stats and icon facts. Used in the homepage "Бүх загвар" grid. */
export function ModelSpecCard({ model }: { model: ModelCardData }) {
  const { quick } = model;
  // The icon and value say what each fact is (Prägnanz); the label is kept for screen readers only.
  // Fuel type is not in this list: it is the badge on the photo (position = first thing seen).
  const facts: { icon: string; label: string; value: string }[] = quick
    ? [
        { icon: quick.drive.toLowerCase(), label: "Хөтлөгч", value: quick.drive },
        { icon: "seats", label: "Суудал", value: countOnly(quick.seats) },
        { icon: "doors", label: quick.doorLabel ?? "Хаалга", value: countOnly(quick.doors) },
        ...(payloadValue(quick.payload) ? [{ icon: "payload", label: "Даац", value: payloadValue(quick.payload) }] : []),
        ...(hasEngine(quick) ? [{ icon: "hybrid", label: "Хөдөлгүүр", value: quick.engine! }] : []),
        { icon: "dimension", label: "Хэмжээ", value: compactSize(quick.size) }
      ]
    : [];
  // With an odd count the last item (size) takes the full row so the grid stays even.
  const wideLast = facts.length % 2 === 1;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[0_10px_30px_rgb(15_35_56/.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgb(15_35_56/.14)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative">
        <Link href={model.href} className="block aspect-[5/3] overflow-hidden bg-surface" tabIndex={-1} aria-hidden="true">
          <img src={model.thumb} alt="" width={400} height={240} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        </Link>
        {/* Emphasis by position: the fuel type sits where the eye lands first. */}
        {quick && (
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 py-1 pl-1.5 pr-3 text-xs font-bold text-[#0f5a3a] shadow-[0_4px_12px_rgb(15_35_56/.14)]">
            <QuickIcon icon="fuel" className="h-4 w-4" />
            {quick.fuel}<span className="font-medium text-ink-secondary">· {FUEL_NAMES[quick.fuel]}</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{model.category}</p>
        <h3 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-ink">
          <Link href={model.href} className="hover:text-[#0f5a3a]">{model.name}</Link>
        </h3>
        {model.stats.length > 0 && (
          // Hierarchy: the first stat (range) is the one big green number; the other two are secondary.
          <dl className="mt-5 grid grid-cols-[1.35fr_1fr_1fr] items-end divide-x divide-line rounded-xl border border-solid border-line bg-white px-4 py-4">
            {model.stats.map((stat, index) => (
              <div key={stat.label} className="flex min-w-0 flex-col px-3 first:pl-0 last:pr-0">
                <dt className="mt-1.5 text-[11px] leading-snug text-ink-muted">{shortStatLabel(stat.label)}</dt>
                <dd className={`order-first m-0 font-bold leading-none ${index === 0 ? "text-[28px] tracking-tight text-[#0f5a3a]" : "text-[18px] text-ink"}`}>
                  {stat.value}<span className="ml-0.5 text-xs font-medium text-ink-muted">{shortStatUnit(stat.unit)}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {facts.length > 0 && (
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-x-4 gap-y-3 p-0">
            {facts.map((fact, index) => (
              <li key={fact.icon} className={`flex min-w-0 items-center gap-2.5 ${wideLast && index === facts.length - 1 ? "col-span-2" : ""}`}>
                {/* Third level: muted grey-green icons without a tile, so the stats and the button lead. */}
                <QuickIcon icon={fact.icon} className="h-6 w-6 text-[#6b8578]" />
                <span className="min-w-0">
                  <span className="sr-only">{fact.label}: </span>
                  <span className="block text-small font-medium leading-snug text-ink-secondary">{fact.value}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {/* Main action filled, secondary tinted: different roles look different (Similarity). */}
          <Link className="btn btn--tint min-w-[160px] flex-1 px-4" href={model.href} aria-label={`${model.name} — дэлгэрэнгүй`}>Дэлгэрэнгүй</Link>
          <Link className="btn btn--primary group/cta min-w-[160px] flex-1 gap-1.5 px-4" href={model.preorderHref} aria-label={`${model.name} — урьдчилсан захиалга`}>
            Урьдчилсан захиалга
            {/* Motion, kept small: the arrow nudges on hover; off for reduced-motion users. */}
            <span aria-hidden="true" className="transition-transform duration-200 group-hover/cta:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/cta:translate-x-0">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
