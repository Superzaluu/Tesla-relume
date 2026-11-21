"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { ModelFamilyCard } from "@/components/cards/ModelFamilyCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  buildGroups, buildRows, familySizes, optionCount, passes, readSelection, sortCards, SORTS, writeSelection,
  type Group, type Option, type Row, type Selection, type SortId
} from "@/components/cards/modelFilters";

/** One use-case row: heading on the left, arrows on the right, family cards scrolling sideways. */
function FamilyRow({ row, sizes }: { row: Row; sizes: Record<string, number> }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const update = useCallback(() => {
    const el = track.current;
    if (el) setEdge({ start: el.scrollLeft <= 1, end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, row]);
  const move = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (el && card) el.scrollBy({ left: dir * (card.offsetWidth + 16) * Math.max(1, Math.floor(el.clientWidth / (card.offsetWidth + 16))), behavior: "smooth" });
  };
  const versions = row.families.reduce((sum, family) => sum + family.members.length, 0);
  const arrow = "grid h-10 w-10 place-items-center rounded-full border border-solid border-line bg-white text-ink transition-colors hover:border-[#0f5a3a] hover:text-[#0f5a3a] disabled:cursor-default disabled:opacity-35";

  return (
    <section aria-labelledby={`row-${row.id}`} className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 id={`row-${row.id}`} className="m-0 text-[26px] font-bold leading-tight tracking-tight text-ink">{row.label}</h3>
          <p className="m-0 mt-1 text-small text-ink-muted">
            {row.text} · {row.families.length} загвар{versions > row.families.length ? `, ${versions} хувилбар` : ""}
          </p>
        </div>
        {!(edge.start && edge.end) && (
          <div className="flex shrink-0 gap-2">
            <button type="button" className={arrow} onClick={() => move(-1)} disabled={edge.start} aria-label={`${row.label}: өмнөх`}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className={arrow} onClick={() => move(1)} disabled={edge.end} aria-label={`${row.label}: дараах`}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
      </div>
      <div
        ref={track} onScroll={update}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]"
      >
        {row.families.map((family) => (
          <ModelFamilyCard key={family.key} family={family} total={sizes[family.key] ?? family.members.length} passengers={row.id === "passenger"} />
        ))}
      </div>
    </section>
  );
}

// Homepage "Бүх загвар": filters on the left (cars.com / rbauction / unegui layout), every option with the
// number of models it leads to (encar), the active choices as removable chips above the results.
// There is no second set of filter controls above the grid (unegui's top brand list was disliked):
// the top row only shows what is chosen, the count and the sort order. On phones the same filters open
// in a full-screen panel with a "N загвар харах" button at the bottom.
// Results: three rows by use (cargo / passengers / refrigerated + special), each scrolling sideways with
// one card per model family (ModelFamilyCard). Filters still work per version.
// Monthly payment on the card (cars.com) comes later, once prices are entered.

type Props = { cards: ModelCardData[]; categories: { id: string; label: string }[] };

function FilterGroups({ groups, selection, count, toggle }: {
  groups: Group[]; selection: Selection; count: (group: Group, option: Option) => number; toggle: (group: Group, option: Option) => void;
}) {
  return (
    <div className="grid gap-1">
      {groups.map((group) => (
        <details key={group.id} open className="group/f border-0 border-b border-solid border-line py-3 last:border-b-0">
          <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-small font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {group.label}
            <span aria-hidden="true" className="text-ink-muted transition-transform group-open/f:rotate-180">⌄</span>
          </summary>
          {group.kind === "list" ? (
            <ul className="m-0 mt-2 grid list-none gap-0.5 p-0">
              {group.options.map((option) => {
                const checked = selection[group.id]?.includes(option.id) ?? false;
                const n = count(group, option);
                return (
                  <li key={option.id}>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-small hover:bg-[#f3f7f5] ${!checked && n === 0 ? "cursor-not-allowed opacity-45" : ""}`}>
                      <input type="checkbox" className="h-[18px] w-[18px] shrink-0 accent-[#0f5a3a]" checked={checked} disabled={!checked && n === 0} onChange={() => toggle(group, option)} />
                      <span className="min-w-0 flex-1 text-ink-secondary">{option.label}</span>
                      <span className="tabular-nums text-ink-muted">{n}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={group.label}>
              {group.options.map((option) => {
                const on = selection[group.id]?.includes(option.id) ?? false;
                const n = count(group, option);
                return (
                  <button
                    key={option.id} type="button" aria-pressed={on} disabled={!on && n === 0} onClick={() => toggle(group, option)}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-solid px-3 py-1.5 text-small font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${on ? "border-[#0f5a3a] bg-[#0f5a3a] text-white" : "border-line bg-white text-ink-secondary hover:border-[#0f5a3a]"}`}
                  >
                    {option.label}
                    <span className={`tabular-nums ${on ? "text-white/75" : "text-ink-muted"}`}>{n}</span>
                  </button>
                );
              })}
            </div>
          )}
        </details>
      ))}
    </div>
  );
}

export function ModelGrid({ cards, categories }: Props) {
  const groups = useMemo(() => buildGroups(cards, categories), [cards, categories]);
  const [selection, setSelection] = useState<Selection>({});
  const [sort, setSort] = useState<SortId>("recommended");
  const [panelOpen, setPanelOpen] = useState(false);
  const ready = useRef(false);
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  // Read the choices from the address after the first render (the page itself is static), then keep it in sync.
  useEffect(() => {
    const initial = readSelection(window.location.search, groups);
    setSelection(initial.selection);
    setSort(initial.sort);
    ready.current = true;
  }, [groups]);
  useEffect(() => {
    if (ready.current) writeSelection(selection, sort, groups);
  }, [selection, sort, groups]);

  // Phone panel: lock the page behind it, close on Escape, give focus back to the button.
  useEffect(() => {
    if (!panelOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPanelOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      openButton.current?.focus();
    };
  }, [panelOpen]);

  const visible = useMemo(() => sortCards(cards.filter((card) => passes(card, groups, selection)), sort), [cards, groups, selection, sort]);
  const rows = useMemo(() => buildRows(visible), [visible]);
  const sizes = useMemo(() => familySizes(cards), [cards]);
  const familyCount = rows.reduce((sum, row) => sum + row.families.length, 0);
  const count = (group: Group, option: Option) => optionCount(cards, groups, selection, group, option);
  const toggle = (group: Group, option: Option) =>
    setSelection((current) => {
      const chosen = current[group.id] ?? [];
      const next = chosen.includes(option.id) ? chosen.filter((id) => id !== option.id) : [...chosen, option.id];
      return { ...current, [group.id]: next };
    });
  const active = groups.flatMap((group) => group.options.filter((option) => selection[group.id]?.includes(option.id)).map((option) => ({ group, option })));
  const clear = () => setSelection({});

  const sortSelect = (id: string) => (
    <label className="flex items-center gap-2 text-small text-ink-secondary">
      <span className="hidden sm:inline">Эрэмбэ</span>
      <select
        id={id} value={sort} onChange={(event) => setSort(event.target.value as SortId)}
        className="min-h-[40px] rounded-lg border border-solid border-line bg-white px-3 font-[inherit] text-small text-ink"
      >
        {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </label>
  );

  return (
    <section className="section" id="models">
      <div className="container container--gap-80">
        <SectionTitle title="Бүх загвар" text="Таны хэрэгцээнд тохирох цахилгаан автомашинаа сонгоорой" />
        <div className="tw lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start lg:gap-10">
          {/* Desktop filters: sticky column on the left. */}
          <aside className="sticky top-[calc(var(--navbar-height)+24px)] hidden max-h-[calc(100vh-var(--navbar-height)-48px)] overflow-y-auto rounded-card border border-solid border-line bg-white px-4 py-3 lg:block" aria-label="Шүүлтүүр">
            <div className="flex items-center justify-between border-0 border-b border-solid border-line pb-3">
              <p className="m-0 text-regular font-bold text-ink">Шүүлтүүр</p>
              {active.length > 0 && <button type="button" onClick={clear} className="text-small font-semibold text-[#0f5a3a] underline underline-offset-2">Арилгах</button>}
            </div>
            <FilterGroups groups={groups} selection={selection} count={count} toggle={toggle} />
          </aside>

          <div className="min-w-0">
            {/* Result bar: count, chosen filters as chips, sort. No filter controls here. */}
            <div className="mb-6 grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="m-0 text-regular text-ink-secondary" aria-live="polite">
                  <strong className="text-ink">{familyCount}</strong> загвар, {visible.length} хувилбар{active.length > 0 ? ` (${cards.length}-аас)` : ""}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    ref={openButton} type="button" onClick={() => setPanelOpen(true)} aria-haspopup="dialog"
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-solid border-line bg-white px-4 text-small font-semibold text-ink lg:hidden"
                  >
                    Шүүлтүүр
                    {active.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#0f5a3a] px-1.5 text-xs text-white">{active.length}</span>}
                  </button>
                  {sortSelect("model-sort")}
                </div>
              </div>
              {active.length > 0 && (
                <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0" aria-label="Сонгосон шүүлтүүр">
                  {active.map(({ group, option }) => (
                    <li key={`${group.id}-${option.id}`}>
                      <button
                        type="button" onClick={() => toggle(group, option)} aria-label={`${group.label}: ${option.label} — арилгах`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#eaf3ee] py-1.5 pl-3 pr-2.5 text-small font-medium text-[#0f5a3a] hover:bg-[#d6e9de]"
                      >
                        <span className="text-[#3c5a4b]">{group.label}:</span> {option.label}
                        <span aria-hidden="true" className="text-base leading-none">×</span>
                      </button>
                    </li>
                  ))}
                  <li><button type="button" onClick={clear} className="px-1 text-small font-semibold text-ink-secondary underline underline-offset-2">Бүгдийг арилгах</button></li>
                </ul>
              )}
            </div>

            {rows.length > 0 ? (
              <div className="grid gap-10">
                {rows.map((row) => <FamilyRow key={row.id} row={row} sizes={sizes} />)}
              </div>
            ) : (
              <div className="rounded-card border border-dashed border-line bg-white px-6 py-12 text-center">
                <p className="m-0 text-regular font-semibold text-ink">Сонгосон шүүлтүүрт тохирох загвар алга</p>
                <p className="m-0 mt-1 text-small text-ink-muted">Нэг хоёр сонголтоо арилгаад дахин үзээрэй.</p>
                <button type="button" onClick={clear} className="btn btn--tint mt-4 px-5">Шүүлтүүр арилгах</button>
              </div>
            )}
          </div>
        </div>

        {/* Phone / tablet filters: full-screen panel. */}
        {panelOpen && (
          <div className="tw fixed inset-0 z-50 flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Шүүлтүүр">
            <div className="flex items-center justify-between border-0 border-b border-solid border-line px-4 py-3" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
              <p className="m-0 text-regular font-bold text-ink">Шүүлтүүр</p>
              <button ref={closeButton} type="button" onClick={() => setPanelOpen(false)} aria-label="Хаах" className="grid h-10 w-10 place-items-center rounded-full text-2xl leading-none text-ink hover:bg-[#f3f7f5]">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <FilterGroups groups={groups} selection={selection} count={count} toggle={toggle} />
            </div>
            <div className="flex gap-3 border-0 border-t border-solid border-line px-4 py-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
              <button type="button" onClick={clear} disabled={active.length === 0} className="btn btn--tint flex-1 px-4 disabled:opacity-50">Арилгах</button>
              <button type="button" onClick={() => setPanelOpen(false)} className="btn btn--primary flex-[2] px-4">{familyCount} загвар харах</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
