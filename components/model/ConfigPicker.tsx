"use client";
// Top of the "Техникийн үзүүлэлт" section: trim (иж бүрдэл) pills, cab / body switches, the chosen
// trim's price, its ten key numbers and ten key equipment lines (Airbnb "What this place offers" style:
// what the trim lacks is struck through). Switching trims swaps the lists in place.
import { useEffect, useState } from "react";
import { SpecIcon } from "@/components/model/SpecIcon";
import type { Picker } from "@/data/specSheet";

const money = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₮`;

function Segmented({ label, items, value, onPick, available }: {
  label: string; items: string[]; value: string; onPick: (item: string) => void; available: (item: string) => boolean;
}) {
  return (
    <div className="mpick__seg" role="group" aria-label={label}>
      {items.map((item) => (
        <button key={item} type="button" aria-pressed={item === value} disabled={!available(item)} onClick={() => onPick(item)}>{item}</button>
      ))}
    </div>
  );
}

export function ConfigPicker({ picker, preorder }: { picker: Picker; preorder: string }) {
  const { trims, cabins, bodies, options, cards } = picker;
  const [trim, setTrim] = useState(options[0].trim);
  const [cabin, setCabin] = useState(options[0].cabin);
  const [body, setBody] = useState(bodies[0] ?? "");

  const find = (t: string, c: string) => options.find((option) => option.trim === t && option.cabin === c);
  const option = find(trim, cabin) ?? options.find((item) => item.trim === trim) ?? options[0];
  const pickTrim = (t: string) => { setTrim(t); if (!find(t, cabin)) setCabin(options.find((item) => item.trim === t)?.cabin ?? ""); };
  const pickCabin = (c: string) => { setCabin(c); if (!find(trim, c)) setTrim(options.find((item) => item.cabin === c)?.trim ?? trim); };

  // Mark the chosen column in the tables under "Бүх үзүүлэлтийг харах".
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-col]").forEach((el) => el.classList.toggle("is-picked", el.dataset.col === String(option.col)));
  }, [option.col]);

  const specs = option.specs.find((item) => item.body === body) ?? option.specs[0];

  return (
    <div className="mpick">
      {(trims.length > 1 || cabins.length > 1 || bodies.length > 1) && (
        <div className="mpick__controls">
          {trims.length > 1 && (
            <div className="mpick__pills" role="group" aria-label="Иж бүрдэл">
              {trims.map((t) => (
                <button key={t} type="button" className="mpick__pill" aria-pressed={t === option.trim} onClick={() => pickTrim(t)}>{t}</button>
              ))}
            </div>
          )}
          {cabins.length > 1 && <Segmented label="Бүхээг" items={cabins} value={option.cabin} onPick={pickCabin} available={(c) => options.some((item) => item.cabin === c)} />}
          {bodies.length > 1 && <Segmented label="Их бие" items={bodies} value={body} onPick={setBody} available={() => true} />}
        </div>
      )}

      <div className="mpick__head">
        <div>
          <p className="mpick__name">{option.name}{body && bodies.length > 1 ? ` · ${body}` : ""}</p>
          <p className="mpick__price">{option.price ? money(option.price) : "Үнэ лавлах"}</p>
        </div>
        <a className="btn btn--primary btn--wide" href={preorder}>{option.price ? "Урьдчилсан захиалга" : "Үнэ лавлах"}</a>
      </div>

      <div className="mkey">
        <div>
          <h3 className="h5 mkey__title">Гол үзүүлэлт</h3>
          <ul className="mkey__list">
            {specs.items.map((item) => (
              <li key={item.label}>
                <SpecIcon icon={item.icon} />
                <span className="mkey__text">
                  <span className="mkey__label">{item.label}</span>
                  <strong>{item.href ? <a href={item.href}>{item.value}</a> : item.value}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {option.equipment.length > 0 && (
          <div>
            <h3 className="h5 mkey__title">Тоноглол</h3>
            <ul className="mkey__list">
              {option.equipment.map((item) => (
                <li key={item.label} className={item.state === "none" ? "is-none" : undefined}>
                  <SpecIcon icon={item.icon} off={item.state === "none"} />
                  <span className="mkey__text">
                    <span className="mkey__name">{item.label}</span>
                    {item.state === "option" && <span className="mkey__note">Нэмэлт сонголтоор</span>}
                    {item.state === "none" && <span className="sr-only"> — энэ иж бүрдэлд байхгүй</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {cards.length > 0 && (
        <div className="mpick__cards">
          <h3 className="h5">Батерейн сонголт</h3>
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
    </div>
  );
}
