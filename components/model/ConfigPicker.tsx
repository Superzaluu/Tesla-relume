"use client";
// "Техникийн үзүүлэлт" body (user, 2026-11-20, variant B of the tidy pass): trim cards with price (best trim
// first) → all equipment as chips by group, marked for the chosen trim, with the explanation under a chip on
// click → the technical groups as cards of equal height, key numbers first with an icon.
// Everything below the trim cards follows the chosen trim (and cab / body when the model has several).
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SpecIcon } from "@/components/model/SpecIcon";
import { useVariant } from "@/components/model/Variant";
import { bodyLabel, bodyParts, markOf, type EquipmentChip, type SheetView } from "@/data/specSheet";

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
function SpecCard({ heading, rows, col, from, skip }: { heading: string; rows: Row[]; col: number; from: number | null; skip?: Set<string> }) {
  const shown = rows.filter((row) => row.cells[col] && !(row.key && skip?.has(row.key)));
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
 * An equipment group as shown under «Тоноглол» (variant B, user, 2026-11-20): its chips, and its text rows
 * (screen size, airbags, tyres…) as one small line under them. The equipment spec cards that repeated the
 * chips are gone; a group with only text rows (colours) still shows its line.
 */
type EquipmentBlock = { heading: string; chips: EquipmentChip[]; texts: Row[] };

function equipmentBlocks(view: SheetView): EquipmentBlock[] {
  return view.full.filter((group) => group.part === "equipment").map((group) => ({
    heading: group.heading,
    chips: view.equipment.find((item) => item.heading === group.heading)?.items ?? [],
    texts: group.rows.filter((row) => !row.mark && !CHIP_TEXT_KEYS.has(row.key ?? ""))
  })).filter((block) => block.chips.length + block.texts.length > 0);
}
/** Text fields that already have a chip (EPB, USB / Type-C): their value is in the chip's explanation. */
const CHIP_TEXT_KEYS = new Set(["parking_brake", "usb"]);

/**
 * Groups in two columns: the largest (chips + text rows) go to the wider left column until it holds about
 * half, the smaller ones stack on the right, so rows of chips line up in long, even blocks.
 */
function equipmentColumns(blocks: EquipmentBlock[]): [EquipmentBlock[], EquipmentBlock[]] {
  const size = (block: EquipmentBlock) => block.chips.length + block.texts.length;
  const sorted = [...blocks].sort((a, b) => size(b) - size(a));
  const total = sorted.reduce((sum, block) => sum + size(block), 0);
  const left: EquipmentBlock[] = [], right: EquipmentBlock[] = [];
  let leftCount = 0;
  for (const block of sorted) {
    if (left.length === 0 || leftCount < total / 2) { left.push(block); leftCount += size(block); }
    else right.push(block);
  }
  return [left, right];
}

/** Charging rows shown in ChargeTimes, so the battery card does not repeat them. */
const CHARGE_KEYS = new Set(["ac_time", "ac_power", "dc_time"]);
/** "≤7.8" + "цаг" → 7.8 «цаг хүртэл»; "8.6–18.2" and "8" keep the plain unit. */
const Time = ({ value, unit }: { value: string; unit: string }) => (
  <>{value.replace(/^\s*≤\s*/, "").trim()} <small>{unit}{/^\s*≤/.test(value) ? " хүртэл" : ""}</small></>
);

/**
 * «Цэнэглэх хугацаа» (user test #1, 2026-11-23, item 2): visitors looked for how long the vehicle takes to charge
 * at home and did not find it (it was row 7+ of the battery card). Now it is the first thing under the trim
 * cards: home / depot charging (AC) first, fast charging (DC) next, for the chosen trim.
 */
function ChargeTimes({ rows, col, from }: { rows: Map<string, Row>; col: number; from: number | null }) {
  const cell = (key: string) => rows.get(key)?.cells[col] ?? "";
  const changed = (key: string) => from !== null && (rows.get(key)?.cells[from] ?? "") !== cell(key);
  const ac = cell("ac_time"), acPower = cell("ac_power"), dc = cell("dc_time");
  if (!ac && !acPower && !dc) return null;
  return (
    <div className="mcharge" id="charge-times">
      <h3 className="h5 mcharge__title">Цэнэглэх хугацаа</h3>
      <div className="mcharge__list">
        {(ac || acPower) && (
          <div className={`mcharge__item is-home${changed("ac_time") ? " is-changed" : ""}`} key={changed("ac_time") ? `ac-${col}` : "ac"}>
            <span className="mcharge__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5" /><path d="M12.8 10.5 10.5 14h3l-2.3 3.5" /></svg>
            </span>
            <span className="mcharge__label">Гэртээ, агуулахдаа (AC)</span>
            <strong className="mcharge__value">{ac ? <Time value={ac} unit="цаг" /> : <>{acPower} <small>кВт</small></>}</strong>
            <span className="mcharge__note">
              {acPower ? `${acPower} кВт-ын удаан цэнэглэгчээр` : "Удаан цэнэглэгчээр"}{ac ? " 0–100%" : ""}. Оройд залгаад өглөө бүрэн цэнэгтэй гарна.
            </span>
          </div>
        )}
        {dc && (
          <div className={`mcharge__item${changed("dc_time") ? " is-changed" : ""}`} key={changed("dc_time") ? `dc-${col}` : "dc"}>
            <span className="mcharge__icon" aria-hidden="true"><SpecIcon icon="charging" /></span>
            <span className="mcharge__label">Хурдан цэнэглэгчээр (DC)</span>
            <strong className="mcharge__value"><Time value={dc} unit="мин" /></strong>
            <span className="mcharge__note">20–80% хүртэл, нийтийн хурдан цэнэглэх станцад.</span>
          </div>
        )}
      </div>
      <Link className="mcharge__link" href="/#chargers">Цэнэглэх станцын байршил →</Link>
    </div>
  );
}

/**
 * The picture card (SmartGrid, «Аюулгүй ба ухаалаг») that explains an equipment chip, if the page has one
 * (user test #1, 2026-11-23, item 5). Looked up in the DOM: the grid tags its cards with `data-features`.
 */
const pictureCard = (key: string) => document.querySelector<HTMLElement>(`[data-features~="${CSS.escape(key)}"]`);

function jumpToCard(key: string) {
  window.dispatchEvent(new Event("smartgrid:show-all"));
  // After the grid has shown every card again.
  window.setTimeout(() => {
    const card = pictureCard(key);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.remove("is-spotlit");
    void card.offsetWidth;
    card.classList.add("is-spotlit");
    window.setTimeout(() => card.classList.remove("is-spotlit"), 2600);
  }, 60);
}

/**
 * User test #1, item 4: nobody saw that the trim cards can be clicked to compare. Once the cards come into
 * view they nudge one after another and a hand taps the next card, until the visitor picks one.
 */
function useTrimNudge(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [nudging, setNudging] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    let timer = 0;
    const check = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8 && rect.bottom > 80) {
        setNudging(true);
        window.removeEventListener("scroll", check);
        timer = window.setTimeout(() => setNudging(false), 4200);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => { window.removeEventListener("scroll", check); window.clearTimeout(timer); };
  }, [active]);
  return { ref, nudging };
}

/** Text rows a group shows under its chips before "Дэлгэрэнгүй". */
const TEXT_ROWS = 4;

const MARK_TEXT: Record<string, string> ={ "●": "Энэ иж бүрдэлд стандартаар", "○": "Нэмэлт сонголтоор" };

/**
 * EC75 / R5 keep cargo and passenger trims in one sheet, named «Ачааны · …» / «Зорчигчийн · …» (migration 0014).
 * The page shows the side picked in the hero switch (VariantProvider) and the names without the prefix.
 */
const SIDE = { cargo: "Ачааны · ", passenger: "Зорчигчийн · " } as const;
/** Key numbers on the power cards (KeySpec icons): what R5 Pro changes. */
const POWER_LINES = ["battery", "motor", "range"];

export function ConfigPicker({ view }: { view: SheetView }) {
  const variant = useVariant();
  const sided = view.picker.options.some((option) => option.name.startsWith(SIDE.cargo) || option.name.startsWith(SIDE.passenger));
  const ownSide = sided ? view.picker.options.filter((option) => option.name.startsWith(SIDE[variant])) : view.picker.options;
  const strip = (text: string) => (sided ? text.replace(SIDE[variant], "") : text);
  const sideOptions = (ownSide.length ? ownSide : view.picker.options).map((option) => ({ ...option, name: strip(option.name), trim: strip(option.trim) }));
  // R5 / EC75 with their Pro (src/data/pro.ts): a power choice first, then that power's trims.
  const powers = view.picker.powers.filter((p) => sideOptions.some((option) => option.power === p));
  const [power, setPower] = useState(powers[0] ?? "");
  const ofPower = (p: string) => (powers.length > 1 ? sideOptions.filter((option) => option.power === p) : sideOptions);
  const options = ofPower(powers.includes(power) ? power : powers[0] ?? "");
  const trims = [...new Set(options.map((option) => option.trim))];
  const cabins = [...new Set(options.map((option) => option.cabin).filter(Boolean))];
  const { bodies, cards } = view.picker;
  const [trim, setTrim] = useState(options[0].trim);
  const [cabin, setCabin] = useState(options[0].cabin);
  const [body, setBody] = useState(bodies[0] ?? "");
  // Switching cargo ↔ passenger: start again from that side's first trim (the power choice stays).
  useEffect(() => { setTrim(options[0].trim); setCabin(options[0].cabin); }, [variant]); // eslint-disable-line react-hooks/exhaustive-deps
  // Switching power keeps the trim's rank (best → best), so only the power-train numbers change and flash.
  const pickPower = (p: string) => {
    const next = [...new Set(ofPower(p).map((option) => option.trim))];
    setPower(p);
    setTrim(next[Math.min(Math.max(trims.indexOf(trim), 0), next.length - 1)]);
  };

  // The comparison table lists both sides; show this side's columns only.
  useEffect(() => {
    if (!sided) return;
    const own = new Set(sideOptions.map((option) => String(option.col)));
    document.querySelectorAll<HTMLElement>(".mcompare [data-col]").forEach((el) => el.classList.toggle("is-other-side", !own.has(el.dataset.col ?? "")));
  }, [variant]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const blocks = equipmentBlocks(view);
  const chargeRows = new Map(view.full.flatMap((group) => group.rows).filter((row) => row.key && CHARGE_KEYS.has(row.key)).map((row) => [row.key!, row]));
  const chargeShown = [...chargeRows.values()].some((row) => row.cells[col]);
  /** The chip whose explanation is open (one at a time). */
  const [openKey, setOpenKey] = useState<string | null>(null);
  /** Whether the open chip has a picture card on this page (checked after it opens). */
  const [hasPicture, setHasPicture] = useState(false);
  useEffect(() => { setHasPicture(openKey ? Boolean(pictureCard(openKey)) : false); }, [openKey]);
  // The trim hint stays until the visitor has switched trims once.
  const [picked, setPicked] = useState(false);
  const nudge = useTrimNudge(many && !picked);

  return (
    <div className="mpick">
      {/* 0. Power choice (R5 | R5 Pro): the only numbers that differ, side by side; picking one filters the trims. */}
      {powers.length > 1 && (
        <div className="mpower">
          <div className="mpower__head">
            <h3 className="h5">Хүчний сонголт</h3>
            <p>Их бие, ачааны тасалгаа нь ижил. Ялгаа нь батерей, мотор, туулах зайд.</p>
          </div>
          <div className="mpower__list" role="group" aria-label="Хүчний сонголт">
            {powers.map((p) => (
              <button key={p} type="button" className="mpower__card" aria-pressed={p === power} onClick={() => pickPower(p)}>
                <span className="mpower__name">{p}</span>
                <dl>
                  {POWER_LINES.map((icon) => {
                    const items = ofPower(p).map((item) => item.specs[0]?.items.find((spec) => spec.icon === icon)).filter((spec) => spec?.value);
                    if (items.length === 0) return null;
                    return (
                      <div key={icon}>
                        <dt><SpecIcon icon={icon} />{items[0]!.label}</dt>
                        <dd>{[...new Set(items.map((spec) => spec!.value))].join(" / ")}</dd>
                      </div>
                    );
                  })}
                </dl>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1. Trim cards: name, price and what this trim adds over the others. */}
      {many && (
        <p className={`mpick__hint${picked ? " is-done" : ""}`}>
          <span className="mpick__hint-hand" aria-hidden="true">👆</span>
          {picked ? "Доорх тоноглол, үзүүлэлт сонгосон иж бүрдлээр шинэчлэгдлээ." : `${trims.length} иж бүрдэл байна. Аль нэг дээр нь дарж ялгааг нь хараарай.`}
        </p>
      )}
      <div ref={nudge.ref} className={`mpick__trims${nudge.nudging ? " is-nudging" : ""}`} role={many ? "group" : undefined} aria-label={many ? "Иж бүрдэл" : undefined}>
        {trims.map((t, i) => {
          const item = optionFor(t);
          const inner = (
            <>
              <span className="mpick__trim-name">{t}</span>
              {item.highlights.length > 0 && <span className="mpick__trim-note">{item.highlights.join(", ")}</span>}
              <span className="mpick__trim-price">{item.price ? money(item.price) : "Үнэ лавлах"}</span>
            </>
          );
          return many
            ? <button key={t} type="button" className="mpick__trim" style={{ "--nudge-i": i } as CSSProperties} aria-pressed={t === option.trim} onClick={() => { pickTrim(t); setPicked(true); }}>{inner}{t !== option.trim && <span className="mpick__trim-cta" aria-hidden="true">Харьцуулах →</span>}</button>
            : <div key={t} className="mpick__trim" aria-current="true">{inner}</div>;
        })}
      </div>
      {(cabins.length > 1 || bodies.length > 1) && (
        <div className="mpick__controls">
          {cabins.length > 1 && <Segmented label="Бүхээг" items={cabins} value={option.cabin} onPick={pickCabin} available={(c) => options.some((item) => item.cabin === c)} />}
          {bodies.length > 1 && <Segmented label="Их бие" items={bodies} value={body} onPick={setBody} available={() => true} show={bodyLabel} />}
        </div>
      )}

      {/* 1b. Charging times first (user test #1, item 2): the battery card no longer repeats these rows. */}
      <ChargeTimes rows={chargeRows} col={option.col} from={from} />

      {/* 2. Equipment (above the technical cards since 2026-11-20, user): every item any trim has, by group with a count; ✓ green = in this trim, ○ = optional,
          – white = not in this trim. A chip opens its explanation under the group; the group's text rows
          follow as one line. Items that differ between trims come first in each group. */}
      {blocks.length > 0 && (
        <div id="equipment" className="mpick__std">
          <div className="mequip__head">
            <h3 className="h3 mpick__specs-title">Тоноглол</h3>
            {many && (
              <p className="mequip__legend">
                <span><i className="is-on" aria-hidden="true" />Энэ иж бүрдэлд</span>
                <span><i className="is-option" aria-hidden="true" />Нэмэлт сонголтоор</span>
                <span><i className="is-off" aria-hidden="true" />Байхгүй</span>
              </p>
            )}
          </div>
          <p className="mpick__specs-sub">Чип дээр дарж тайлбарыг нь үзнэ.</p>
          <div className="mequip">
            {equipmentColumns(blocks).map((column, c) => (
              <div className="mequip__col" key={c}>
                {column.map((block) => {
                  const on = block.chips.filter((item) => item.marks[col] === "●").length;
                  const openChip = block.chips.find((item) => item.key === openKey);
                  const texts = block.texts.filter((row) => row.cells[col]);
                  return (
                    <div className="mequip__group" key={block.heading}>
                      <h4 className="mequip__title">
                        {block.heading}
                        {block.chips.length > 0 && (
                          <span className="mequip__count" aria-label={`${block.chips.length}-аас ${on}`}>
                            {on}/{block.chips.length}
                            <span className="mequip__bar" aria-hidden="true"><i style={{ width: `${(on / block.chips.length) * 100}%` }} /></span>
                          </span>
                        )}
                      </h4>
                      {block.chips.length > 0 && (
                        <ul className="mpick__chips mequip__chips">
                          {block.chips.map((item) => {
                            const mark = item.marks[col];
                            const state = mark === "●" ? "is-on" : mark === "○" ? "is-option" : "is-off";
                            const flipped = from !== null && item.marks[from] !== mark;
                            return (
                              <li key={flipped ? `${item.key}-${col}` : item.key} className={`${state}${flipped ? " is-flipped" : ""}${openKey === item.key ? " is-open" : ""}`}>
                                <button
                                  type="button" aria-expanded={openKey === item.key} aria-controls={`chip-note-${item.key}`}
                                  aria-label={`${item.name}: ${MARK_TEXT[mark] ?? "байхгүй"}. Тайлбар`}
                                  onClick={() => setOpenKey(openKey === item.key ? null : item.key)}
                                >
                                  {item.name}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {openChip && (
                        <div className="mequip__note" id={`chip-note-${openChip.key}`} role="region" aria-label={openChip.name}>
                          <MarkCheck cell={openChip.marks[col]} />
                          <div>
                            <b>{openChip.label}</b>
                            <span className="mequip__note-state">
                              {MARK_TEXT[openChip.marks[col]] ?? "Энэ иж бүрдэлд байхгүй"}
                              {openChip.notes[col] && openChip.notes[col] !== openChip.marks[col] ? ` · ${openChip.notes[col]}` : ""}
                            </span>
                            {openChip.hint && <p>{openChip.hint}</p>}
                            {hasPicture && (
                              <button type="button" className="mequip__note-jump" onClick={() => jumpToCard(openChip.key)}>
                                Зурагтай тайлбарыг харах <span aria-hidden="true">↑</span>
                              </button>
                            )}
                          </div>
                          <button type="button" className="mequip__note-close" aria-label="Хаах" onClick={() => setOpenKey(null)}>×</button>
                        </div>
                      )}
                      {texts.length > 0 && (() => {
                        const line = (row: Row) => {
                          const changed = from !== null && (row.cells[from] ?? "") !== row.cells[col];
                          return (
                            <span key={changed ? `${row.label}-${col}` : row.label} className={changed ? "is-changed" : undefined}>
                              {row.label.replace(/\s*\([^)]*\)\s*$/, "")}: <b><Value value={row.cells[col]} /></b>
                            </span>
                          );
                        };
                        // The first TEXT_ROWS show; a long list (the cabin has ~16) folds behind "Дэлгэрэнгүй".
                        return (
                          <>
                            <p className="mequip__texts">{texts.slice(0, TEXT_ROWS).map(line)}</p>
                            {texts.length > TEXT_ROWS && (
                              <details className="mequip__more">
                                <summary>Дэлгэрэнгүй (+{texts.length - TEXT_ROWS})</summary>
                                <p className="mequip__texts">{texts.slice(TEXT_ROWS).map(line)}</p>
                              </details>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Technical groups (general, size, motor, battery, extender) as cards of equal height in one row;
          the key numbers are the icon rows at the top of each card. */}
      <div className="mpick__specs">
        <h3 className="h3 mpick__specs-title">Техник үзүүлэлт</h3>
        <p className="mpick__specs-sub">
          {powers.length > 1 && `${option.power} · `}{option.name}{body && bodies.length > 1 ? ` · ${bodyLabel(body)}` : ""}
          {many && " · Иж бүрдэл солиход өөрчлөгдсөн утга шараар гэрэлтэнэ."}
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

        <div className="mgroups mgroups--core">
          {view.full.filter((group) => group.part === "core").map((group) => <SpecCard key={group.heading} heading={group.heading} rows={group.rows} col={col} from={from} skip={chargeShown ? CHARGE_KEYS : undefined} />)}
        </div>
      </div>
    </div>
  );
}
