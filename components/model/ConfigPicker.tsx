"use client";
// "Техникийн үзүүлэлт" body, B′ layout (user's Figma, 2026-11-20): trim cards with price (best trim first) →
// all equipment by group, marked for the chosen trim → every spec group as a card, its key numbers first with an icon.
// Everything below the trim cards follows the chosen trim (and cab / body when the model has several).
import { useEffect, useState, type MouseEvent } from "react";
import { SpecIcon } from "@/components/model/SpecIcon";
import { useVariant } from "@/components/model/Variant";
import { bodyLabel, bodyParts, markOf, type SheetView } from "@/data/specSheet";

const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₮`;
/** Rows a spec card shows before its own "Бүгдийг харах". */
const CARD_ROWS = 6;

/** One cell; body-dependent values ("Задгай: … · Битүү: …") get one line per body type. */
export function Value({ value }: { value: string }) {
  const parts = bodyParts(value || "–");
  if (parts.length === 1 && !parts[0][0]) return <>{value || "–"}</>;
  return <>{parts.map(([body, part]) => <span className="msheet__body" key={body}><b>{bodyLabel(body)}</b>{part}</span>)}</>;
}

/** Short explanation of a term under the row label (FIELDS[].hint), e.g. what "2C" means. */
export const RowHint = ({ hint }: { hint?: string }) => (hint ? <small className="msheet__hint">{hint}</small> : null);

function Segmented({ label, items, value, onPick, available, show = (item) => item }: {
  label: string; items: string[]; value: string; onPick: (item: string) => void; available: (item: string) => boolean; show?: (item: string) => string;
}) {
  return (
    <div className="mpick__seg" role="group" aria-label={label}>
      {items.map((item) => (
        <button key={item} type="button" aria-pressed={item === value} disabled={!available(item)} onClick={() => onPick(item)}>{show(item)}</button>
      ))}
    </div>
  );
}

type Row = SheetView["full"][number]["rows"][number];

/**
 * Equipment mark as a check in a circle before the label (user, 2026-11-20), coloured like the equipment chips:
 * ✓ filled green = standard, ○ green ring = optional extra, – grey dashed = not in this trim.
 */
const MARK_STATE = { "●": ["is-on", "стандарт"], "○": ["is-option", "нэмэлт сонголтоор"] } as Record<string, [string, string]>;
function MarkCheck({ cell }: { cell: string }) {
  const [state, text] = MARK_STATE[markOf(cell)] ?? ["is-off", "байхгүй"];
  return <span className={`mcheck ${state}`} role="img" aria-label={text} />;
}
/** The words after the mark ("● багажны самбарт" → "багажны самбарт"); the check already says the rest. */
const markNote = (cell: string) => cell.replace(/^\s*[●○–-]\s*/, "");

/** "drive" follows the trim's own value: FWD / RWD / AWD icon. */
const rowIcon = (icon: string, cell: string) => (icon !== "drive" ? icon : /AWD/i.test(cell) ? "awd" : /FWD/i.test(cell) ? "fwd" : "rwd");

/**
 * `from`: the trim shown before the last switch. A row whose value differs from it flashes once; its key
 * includes the column so the flash replays on every switch.
 */
function SpecCard({ heading, rows, col, from }: { heading: string; rows: Row[]; col: number; from: number | null }) {
  const shown = rows.filter((row) => row.cells[col]);
  if (shown.length === 0) return null;
  // Key-number rows (icon) come first and are set a little stronger; the rest are plain label / value lines.
  const line = (row: Row) => {
    const changed = from !== null && (row.cells[from] ?? "") !== row.cells[col];
    return (
    <div
      className={`mgroup__row${row.icon ? " is-key" : ""}${changed ? " is-changed" : ""}`}
      key={changed ? `${row.label}-${col}` : row.label}
      id={row.key ? `spec-${row.key}` : undefined}
    >
      <dt>
        {row.icon && <SpecIcon icon={rowIcon(row.icon, row.cells[col])} />}
        {row.mark && <MarkCheck cell={row.cells[col]} />}
        <span>
          {row.label}
          {/* A mark's note ("Цахилгаан агааржуулагч, PTC халаагууртай") goes under the label, so the label and
              hint keep the card's full width instead of a squeezed column. */}
          {row.mark && markNote(row.cells[col]) && <b className="mgroup__note">{markNote(row.cells[col])}</b>}
          <RowHint hint={row.hint} />
        </span>
      </dt>
      {!row.mark && <dd>{row.href ? <a href={row.href}>{row.cells[col]}</a> : <Value value={row.cells[col]} />}</dd>}
    </div>
    );
  };
  return (
    <div className="mgroup">
      <h4 className="mgroup__title">{heading}</h4>
      <dl className="mgroup__list">{shown.slice(0, CARD_ROWS).map(line)}</dl>
      {shown.length > CARD_ROWS && (
        <details className="mgroup__more">
          <summary>Бүгдийг харах (+{shown.length - CARD_ROWS})</summary>
          <dl className="mgroup__list">{shown.slice(CARD_ROWS).map(line)}</dl>
        </details>
      )}
    </div>
  );
}

/**
 * Equipment chip → its row in the spec cards below, where the hint explains it (user, 2026-11-20). Opens the
 * card's "Бүгдийг харах" when the row is folded away, centres the row and flashes it once.
 */
function showSpecRow(event: MouseEvent<HTMLAnchorElement>, key: string) {
  const row = document.getElementById(`spec-${key}`);
  if (!row) return;
  event.preventDefault();
  const folded = row.closest("details");
  if (folded) folded.open = true;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  row.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
  row.classList.remove("is-target");
  void row.offsetWidth;
  row.classList.add("is-target");
  window.setTimeout(() => row.classList.remove("is-target"), 2200);
  // No history.replaceState here: Next's router answers it with a re-render that closed the card again.
}

/**
 * EC75 / R5 keep cargo and passenger trims in one sheet, named «Ачааны · …» / «Зорчигчийн · …» (migration 0014).
 * The page shows the side picked in the hero switch (VariantProvider) and the names without the prefix.
 */
const SIDE = { cargo: "Ачааны · ", passenger: "Зорчигчийн · " } as const;

export function ConfigPicker({ view }: { view: SheetView }) {
  const variant = useVariant();
  const sided = view.picker.options.some((option) => option.name.startsWith(SIDE.cargo) || option.name.startsWith(SIDE.passenger));
  const ownSide = sided ? view.picker.options.filter((option) => option.name.startsWith(SIDE[variant])) : view.picker.options;
  const strip = (text: string) => (sided ? text.replace(SIDE[variant], "") : text);
  const options = (ownSide.length ? ownSide : view.picker.options).map((option) => ({ ...option, name: strip(option.name), trim: strip(option.trim) }));
  const trims = [...new Set(options.map((option) => option.trim))];
  const cabins = [...new Set(options.map((option) => option.cabin).filter(Boolean))];
  const { bodies, cards } = view.picker;
  const [trim, setTrim] = useState(options[0].trim);
  const [cabin, setCabin] = useState(options[0].cabin);
  const [body, setBody] = useState(bodies[0] ?? "");
  // Switching cargo ↔ passenger: start again from that side's first trim.
  useEffect(() => { setTrim(options[0].trim); setCabin(options[0].cabin); }, [variant]); // eslint-disable-line react-hooks/exhaustive-deps

  const find = (t: string, c: string) => options.find((option) => option.trim === t && option.cabin === c);
  const optionFor = (t: string) => find(t, cabin) ?? options.find((item) => item.trim === t) ?? options[0];
  const option = optionFor(trim);
  const pickTrim = (t: string) => { setTrim(t); if (!find(t, cabin)) setCabin(options.find((item) => item.trim === t)?.cabin ?? ""); };
  const pickCabin = (c: string) => { setCabin(c); if (!find(trim, c)) setTrim(options.find((item) => item.cabin === c)?.trim ?? trim); };

  // Mark the chosen column in the trim comparison table.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-col]").forEach((el) => el.classList.toggle("is-picked", el.dataset.col === String(option.col)));
  }, [option.col]);

  // The trim shown before the last switch: equipment chips and spec values that differ from it get a short
  // pulse / flash. Null on first render, so nothing animates on page load.
  const [shown, setShown] = useState({ col: option.col, from: null as number | null });
  if (shown.col !== option.col) setShown({ col: option.col, from: shown.col });
  const from = shown.from;

  const many = trims.length > 1;
  const col = option.col;

  return (
    <div className="mpick">
      {/* 1. Trim cards: name, price and what this trim adds over the others. */}
      <div className="mpick__trims" role={many ? "group" : undefined} aria-label={many ? "Иж бүрдэл" : undefined}>
        {trims.map((t) => {
          const item = optionFor(t);
          const inner = (
            <>
              <span className="mpick__trim-name">{t}</span>
              {item.highlights.length > 0 && <span className="mpick__trim-note">{item.highlights.join(", ")}</span>}
              <span className="mpick__trim-price">{item.price ? money(item.price) : "Үнэ лавлах"}</span>
            </>
          );
          return many
            ? <button key={t} type="button" className="mpick__trim" aria-pressed={t === option.trim} onClick={() => pickTrim(t)}>{inner}</button>
            : <div key={t} className="mpick__trim" aria-current="true">{inner}</div>;
        })}
      </div>
      {(cabins.length > 1 || bodies.length > 1) && (
        <div className="mpick__controls">
          {cabins.length > 1 && <Segmented label="Бүхээг" items={cabins} value={option.cabin} onPick={pickCabin} available={(c) => options.some((item) => item.cabin === c)} />}
          {bodies.length > 1 && <Segmented label="Их бие" items={bodies} value={body} onPick={setBody} available={() => true} show={bodyLabel} />}
        </div>
      )}

      {/* 2. Equipment (user, 2026-11-20): every item any trim has, by group with a count. Items stay in place
          when the trim changes; only their state flips: ✓ green = in this trim, ○ = optional extra, – white =
          not in this trim. Items that differ between trims come first in each group. */}
      {view.equipment.length > 0 && (
        <div id="equipment" className="mpick__std">
          <div className="mequip__head">
            <h3 className="h5">Тоноглол</h3>
            {many && (
              <p className="mequip__legend">
                <span><i className="is-on" aria-hidden="true" />Энэ иж бүрдэлд</span>
                <span><i className="is-option" aria-hidden="true" />Нэмэлт сонголтоор</span>
                <span><i className="is-off" aria-hidden="true" />Байхгүй</span>
              </p>
            )}
          </div>
          <div className="mequip">
            {view.equipment.map((group) => {
              const on = group.items.filter((item) => item.marks[col] === "●").length;
              return (
                <div className="mequip__group" key={group.heading}>
                  <h4 className="mequip__title">
                    {group.heading}
                    <span className="mequip__count" aria-label={`${group.items.length}-аас ${on}`}>
                      {on}/{group.items.length}
                      <span className="mequip__bar" aria-hidden="true"><i style={{ width: `${(on / group.items.length) * 100}%` }} /></span>
                    </span>
                  </h4>
                  <ul className="mpick__chips mequip__chips">
                    {group.items.map((item) => {
                      const mark = item.marks[col];
                      const state = mark === "●" ? "is-on" : mark === "○" ? "is-option" : "is-off";
                      const flipped = from !== null && item.marks[from] !== mark;
                      return (
                        <li
                          key={flipped ? `${item.name}-${col}` : item.name}
                          className={`${state}${flipped ? " is-flipped" : ""}`}
                        >
                          <a
                            href={`#spec-${item.key}`}
                            onClick={(event) => showSpecRow(event, item.key)}
                            aria-label={`${item.name}: ${mark === "●" ? "стандарт" : mark === "○" ? "нэмэлт сонголтоор" : "байхгүй"}. Тайлбар руу очих`}
                          >
                            {item.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Battery choices, then every spec group as a card; the key numbers are the icon rows at the top of
          each card (the separate key-number list repeated them; user, 2026-11-20). */}
      <div className="mpick__specs">
        <h3 className="h3 mpick__specs-title">Техник үзүүлэлт</h3>
        <p className="mpick__specs-sub">
          {option.name}{body && bodies.length > 1 ? ` · ${bodyLabel(body)}` : ""}
          <span className="mcheck-legend"><span className="mcheck is-on" aria-hidden="true" />стандарт</span>
          <span className="mcheck-legend"><span className="mcheck is-option" aria-hidden="true" />нэмэлт сонголтоор</span>
          <span className="mcheck-legend"><span className="mcheck is-off" aria-hidden="true" />байхгүй</span>
        </p>

        {cards.length > 0 && (
          <div className="mpick__cards">
            <h4 className="h5">Батерейн сонголт</h4>
            <ul>
              {cards.map((card) => (
                <li key={card.title}>
                  <p className="mpick__card-title">{card.title}</p>
                  {card.lines.map((line) => <p key={line.label}><span>{line.label}</span> {line.value}</p>)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mgroups">
          {view.full.map((group) => <SpecCard key={group.heading} heading={group.heading} rows={group.rows} col={col} from={from} />)}
        </div>
      </div>
    </div>
  );
}
