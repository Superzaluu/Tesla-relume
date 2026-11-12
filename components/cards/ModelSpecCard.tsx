import Link from "next/link";
import type { QuickSpecs } from "@/data/types";
import { quickIconSrc } from "@/components/ui/QuickSpecs";

export type ModelCardData = {
  key: string;
  href: string;
  thumb: string;
  name: string;
  desc: string;
  categoryId: string;
  category: string;
  stats: { value: string; unit: string; label: string }[];
  quick?: QuickSpecs;
};

/** Model card with photo, key stats and icon facts. Used in the homepage "Бүх загвар" grid. */
export function ModelSpecCard({ model }: { model: ModelCardData }) {
  const { quick } = model;
  const facts = quick
    ? [
        { icon: quick.drive.toLowerCase(), label: "Хөтлөгч", value: quick.drive },
        { icon: "seats", label: "Суудал", value: quick.seats },
        { icon: "payload", label: "Даац", value: quick.payload },
        { icon: "doors", label: quick.doorLabel ?? "Хаалга", value: quick.doors },
        { icon: "dimension", label: "Хэмжээ", value: quick.size, wide: true }
      ]
    : [];

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[0_10px_30px_rgb(15_35_56/.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgb(15_35_56/.14)]">
      <Link href={model.href} className="block aspect-[5/3] overflow-hidden bg-surface" tabIndex={-1} aria-hidden="true">
        <img src={model.thumb} alt="" width={400} height={240} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#147a48]">{model.category}</p>
        <h3 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-ink">
          <Link href={model.href} className="hover:text-[#0f5a3a]">{model.name}</Link>
        </h3>
        <p className="mt-1 text-small text-ink-secondary">{model.desc}</p>

        {model.stats.length > 0 && (
          <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-line py-4">
            {model.stats.map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-col">
                <dt className="mt-1.5 text-[11px] leading-snug text-ink-muted">{stat.label}</dt>
                <dd className="order-first m-0 text-[20px] font-bold leading-none text-ink">
                  {stat.value}<span className="ml-0.5 text-xs font-medium text-ink-muted">{stat.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {facts.length > 0 && (
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-x-4 gap-y-2.5 p-0">
            {facts.map((fact) => (
              <li key={fact.label} className={`flex min-w-0 items-start gap-2 ${fact.wide ? "col-span-2" : ""}`}>
                <img src={quickIconSrc(fact.icon)} alt="" aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 object-contain" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{fact.label}</span>
                  <span className="block text-small font-medium leading-snug text-ink">{fact.value}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Link className="btn btn--primary min-w-[160px] flex-1 px-4" href={model.href}>Дэлгэрэнгүй</Link>
          <a className="btn btn--secondary min-w-[160px] flex-1 px-4" href="#test-drive">Урьдчилсан захиалга</a>
        </div>
      </div>
    </article>
  );
}
