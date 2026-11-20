"use client";
// "Техникийн үзүүлэлт" body, B′ layout (user's Figma, 2026-11-20): trim cards with price → the chosen
// trim's standard equipment as chips → test-drive band → key numbers and every spec group as cards.
// Everything below the trim cards follows the chosen trim (and cab / body when the model has several).
import { useEffect, useState } from "react";
import { SpecIcon } from "@/components/model/SpecIcon";
import { LoadingLink } from "@/components/ui/LoadingLink";
import { calTestDrive } from "@/components/ui/CalTestDrive";
import { bodyLabel, bodyParts, type SheetView } from "@/data/specSheet";

const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₮`;
/**
 * A fixed key-number slot without a value shows a dash: visitors should not read "Тодруулна уу" (ask us)
 * on every gap (user, 2026-11-20). The admin form still says "Тодруулна уу" so the gaps get filled.
 */
const MISSING = "—";
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

function SpecCard({ heading, rows, col }: { heading: string; rows: Row[]; col: number }) {
  const shown = rows.filter((row) => row.cells[col]);
  if (shown.length === 0) return null;
  const line = (row: Row) => (
    <div className="mgroup__row" key={row.label}>
      <dt>{row.label}<RowHint hint={row.hint} /></dt>
      <dd><Value value={row.cells[col]} /></dd>
    </div>
  );
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

export function ConfigPicker({ view, model, preorder }: { view: SheetView; model: string; preorder: string }) {
  const { trims, cabins, bodies, options, cards } = view.picker;
  const [trim, setTrim] = useState(options[0].trim);
  const [cabin, setCabin] = useState(options[0].cabin);
  const [body, setBody] = useState(bodies[0] ?? "");

  const find = (t: string, c: string) => options.find((option) => option.trim === t && option.cabin === c);
  const optionFor = (t: string) => find(t, cabin) ?? options.find((item) => item.trim === t) ?? options[0];
  const option = optionFor(trim);
  const pickTrim = (t: string) => { setTrim(t); if (!find(t, cabin)) setCabin(options.find((item) => item.trim === t)?.cabin ?? ""); };
  const pickCabin = (c: string) => { setCabin(c); if (!find(trim, c)) setTrim(options.find((item) => item.cabin === c)?.trim ?? trim); };

  // Mark the chosen column in the trim comparison table.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-col]").forEach((el) => el.classList.toggle("is-picked", el.dataset.col === String(option.col)));
  }, [option.col]);

  const specs = option.specs.find((item) => item.body === body) ?? option.specs[0];
  const many = trims.length > 1;

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

      {/* 2. Standard equipment of the chosen trim. */}
      {option.standard.length > 0 && (
        <div id="equipment" className="mpick__std">
          <h3 className="h5">{many ? "Энэ иж бүрдэлд стандартаар" : "Стандарт тоноглол"}</h3>
          <ul className="mpick__chips">{option.standard.map((name) => <li key={name}>{name}</li>)}</ul>
        </div>
      )}

      {/* 3. Test-drive band. */}
      <div className="mpick__band">
        <div>
          <p className="mpick__band-title">{model}-г туршаад үзээрэй</p>
          <p className="mpick__band-text">Туршилтын жолоодлого 20,000₮ · Батерейн баталгаа 6 жил / 300,000 км</p>
        </div>
        <div className="mpick__band-actions">
          <button type="button" className="btn mpick__band-primary" {...calTestDrive}>Цаг захиалах</button>
          <LoadingLink className="btn mpick__band-secondary" href={preorder}>{option.price ? "Урьдчилсан захиалга" : "Үнэ лавлах"}</LoadingLink>
        </div>
      </div>

      {/* 4. Key numbers (fixed slots), battery choices, then every spec group as a card. */}
      <div className="mpick__specs">
        <h3 className="h3 mpick__specs-title">Техник үзүүлэлт</h3>
        <p className="mpick__specs-sub">{option.name}{body && bodies.length > 1 ? ` · ${bodyLabel(body)}` : ""} · ● стандарт · ○ нэмэлт сонголтоор · – байхгүй</p>
        <ul className="mkey__list mpick__key spotlight">
          {/* Fixed slots: a slot without a value keeps its place ("—") so icons never shift. */}
          {specs.items.map((item) => (
            <li key={item.label} className={item.value ? undefined : "is-missing"}>
              <SpecIcon icon={item.icon} />
              <span className="mkey__text">
                <span className="mkey__label">{item.label}</span>
                {item.value
                  ? <strong>{item.href ? <a href={item.href}>{item.value}</a> : item.value}</strong>
                  : <span className="mkey__missing">{MISSING}</span>}
              </span>
            </li>
          ))}
        </ul>

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
          {view.full.map((group) => <SpecCard key={group.heading} heading={group.heading} rows={group.rows} col={option.col} />)}
        </div>
      </div>
    </div>
  );
}
