"use client";
import Link from "next/link";
import { useState } from "react";
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { payloadKg, payloadText, rangeKm, seats, spanText, type Family } from "@/components/cards/modelFilters";
import { QuickIcon } from "@/components/ui/QuickSpecs";
import { LoadingLink } from "@/components/ui/LoadingLink";
import { CarShine, shineMask } from "@/components/ui/CarShine";

// One card per model family (EC75 + EC75 Pro, the C5 versions…) in a sideways row of the homepage grid.
// Two tiles give the family's range of the numbers buyers compare (as in "Battery options 45 / 55 kWh"),
// chips lead to each version's page. Icons are the same QuickIcon set as on the version cards.

const FUEL_NAMES: Record<string, string> = { BEV: "Цахилгаан", EREV: "Зай сунгагчтай", PHEV: "Хайбрид" };
const COMING_SOON = "/assets/coming-soon.svg";
const SHOWN_CHIPS = 4;

/** Chip text: the family name for the base version, the rest of the name for the others ("EC75 Pro" → "Pro"). */
function chipLabel(member: ModelCardData, family: string) {
  if (member.name === family) return family;
  const rest = member.name.startsWith(`${family} `) ? member.name.slice(family.length + 1) : member.name;
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

function Tile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#f3f7f5] px-2 py-2">
      {/* Framed icon: white circle with a thin green ring (user, 2026-11-15). */}
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-solid border-[#bcd7c7] bg-white text-[#0f5a3a] sm:h-9 sm:w-9">
        <QuickIcon icon={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{label}</span>
        {/* One line: tons and "415–420 км" fit the tile; anything longer is cut with an ellipsis, the title shows it. */}
        <span className="block truncate text-[14px] font-bold leading-tight tracking-tight text-ink" title={value || undefined}>{value || "—"}</span>
      </span>
    </div>
  );
}

export function ModelFamilyCard({ family, total, passengers }: { family: Family; total: number; passengers: boolean }) {
  const [allChips, setAllChips] = useState(false);
  const { members, name } = family;
  const lead = members.find((m) => m.thumb !== COMING_SOON) ?? members[0];
  const fuels = [...new Set(members.map((m) => m.quick?.fuel).filter(Boolean))] as string[];
  const categories = [...new Set(members.map((m) => m.category))].join(" · ");
  const chips = allChips ? members : members.slice(0, SHOWN_CHIPS);
  const filtered = members.length < total;
  const thumbMask = shineMask(lead.thumb);

  return (
    <article className="flex w-[308px] shrink-0 snap-start flex-col overflow-hidden rounded-card border border-solid border-line bg-white shadow-[0_8px_24px_rgb(15_35_56/.08)] sm:w-[336px]">
      <Link href={lead.href} className="spotlight relative block aspect-[16/9] overflow-hidden bg-surface" tabIndex={-1} aria-hidden="true">
        <img src={lead.thumb} alt="" width={400} height={225} loading="lazy" className="h-full w-full object-cover" />
        {/* Light on the vehicle only, following the mouse. */}
        {thumbMask && <CarShine mask={thumbMask} />}
        {fuels.length > 0 && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 py-1 pl-1.5 pr-2.5 text-xs font-bold text-[#0f5a3a] shadow-[0_4px_12px_rgb(15_35_56/.14)]">
            <QuickIcon icon="fuel" className="h-4 w-4" />
            {fuels.length === 1 ? <>{fuels[0]}<span className="font-medium text-ink-secondary">· {FUEL_NAMES[fuels[0]]}</span></> : fuels.join(" · ")}
          </span>
        )}
        {total > 1 && (
          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-full bg-[#0f5a3a]/95 px-2.5 py-1 text-xs font-bold text-white">
            {filtered ? `${members.length} / ${total}` : total} хувилбар
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{categories}</p>
          <h3 className="m-0 mt-0.5 text-[22px] font-bold leading-tight tracking-tight text-ink">
            <Link href={lead.href} className="hover:text-[#0f5a3a]">{name}</Link>
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {passengers
            ? <Tile icon="seats" label="Суудал" value={spanText(members.map(seats), "")} />
            : <Tile icon="payload" label="Даац" value={payloadText(members.map(payloadKg))} />}
          <Tile icon="range" label="Туулах зай" value={spanText(members.map(rangeKm), "км")} />
        </div>

        {members.length > 1 && (
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label={`${name}: хувилбарууд`}>
            {chips.map((member) => (
              <li key={member.key}>
                <Link
                  href={member.href} title={`${member.name} — ${member.desc}`}
                  className="inline-flex rounded-full border border-solid border-line bg-white px-2.5 py-1 text-xs font-medium text-ink-secondary hover:border-[#0f5a3a] hover:text-[#0f5a3a]"
                >
                  {chipLabel(member, name)}
                </Link>
              </li>
            ))}
            {members.length > SHOWN_CHIPS && (
              <li>
                <button
                  type="button" onClick={() => setAllChips((v) => !v)} aria-expanded={allChips}
                  className="inline-flex rounded-full bg-[#eaf3ee] px-2.5 py-1 text-xs font-semibold text-[#0f5a3a] hover:bg-[#d6e9de]"
                >
                  {allChips ? "Хураах" : `+${members.length - SHOWN_CHIPS}`}
                </button>
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <Link className="btn btn--tint min-h-[40px] flex-1 px-3" href={lead.href} aria-label={`${name} — дэлгэрэнгүй`}>Дэлгэрэнгүй</Link>
          <LoadingLink className="btn btn--primary min-h-[40px] flex-1 px-3" href={lead.preorderHref} aria-label={`${lead.name} — урьдчилсан захиалга`}>Захиалах</LoadingLink>
        </div>
      </div>
    </article>
  );
}
