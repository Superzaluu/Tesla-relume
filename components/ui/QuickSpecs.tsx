import type { CSSProperties, ReactNode } from "react";
import { T } from "@/components/model/VariantValues";
import { hasEngine, type QuickSpecs as Specs } from "@/data/types";

const ICONS: Record<string, string> = {
  van: "01_van.png", flatbed: "02_light_flatbed_truck.png", box: "03_light_box_truck.png", refrigerator: "04_refrigerator_truck.png",
  flatbed4: "05_flatbed_4door_truck.png", fwd: "06_FWD.svg", awd: "07_AWD.svg", rwd: "08_RWD.svg", fuel: "09_fuel.svg",
  dimension: "10_dimension.svg", doors: "11_doors.svg",
  charging: "12_charging.svg", range: "13_range.svg", engine: "17_engine.svg", seats: "15_seats.svg", payload: "16_payload_filled.svg",
  motor: "18_motor.svg", hybrid: "19_hybrid.svg"
};

/** Path of a quick-spec icon by key (van, flatbed, fwd, seats, payload, ...). */
export const quickIconSrc = (key: string) => `/assets/icons/${encodeURI(ICONS[key] ?? ICONS.van)}`;

/** "5130 x 1860 x 2020 мм" → "5130×1860×2020 мм" so the size fits on one line. */
export const compactSize = (size: string) => size.replace(/\s*[xх×]\s*/g, "×");

/** "5 хаалга" → "5", "2–14 суудал" → "2–14": the icon already says doors / seats. */
export const countOnly = (value: string) => value.replace(/\s*(хаалга|суудал)\s*$/i, "");

/** Payload is hidden until a real value is entered (the old placeholder text counts as empty). */
export const payloadValue = (payload: string) => (/^тохируулгаас хамаар/i.test(payload.trim()) ? "" : payload.trim());

const kmNumber = (value: string) => value.replace(/\s*км.*$/i, "").trim();

/** EREV/PHEV: battery-only / total range, "115/1200 км". BEV (or no battery-only figure): the range as is. */
export const rangeValue = (specs: Specs) =>
  specs.fuel !== "BEV" && specs.evRange && !/ev/i.test(specs.range) && specs.range
    ? `${kmNumber(specs.evRange)}/${kmNumber(specs.range)} км`
    : specs.range;

/** Fast-charge time: the key stat when there is one ("18 мин"), otherwise the icon field without its "DC -" prefix. */
export const chargeValue = (specs: Specs) => specs.fastCharge ?? specs.charge.replace(/^\s*(AC\/DC|DC|AC)\s*[-–]\s*/i, "").trim();

/** Motor: BEV "130 кВт" with the electric motor icon; EREV/PHEV "110 кВт/1,499 cc" with the hybrid icon. */
export const motorFact = (specs: Specs) => {
  const value = specs.fuel === "BEV" ? specs.power : [specs.power, hasEngine(specs) ? specs.engine : undefined].filter(Boolean).join("/");
  return value ? { icon: specs.fuel === "BEV" ? "motor" : "hybrid", value } : null;
};

/**
 * Quick-spec icon drawn as a CSS mask, so it takes the text colour (`color`) exactly —
 * the same brand green on the card and the hero. Size it with width/height classes.
 */
export function QuickIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <span className={`quick-icon ${className}`} style={{ "--icon": `url("${quickIconSrc(icon)}")` } as CSSProperties} aria-hidden="true" />;
}

// The icon and value say what each item is (Prägnanz); the label is kept for screen readers only.
function Item({ icon, label, value }: { icon: string; label: string; value: ReactNode }) {
  return (
    <span className="hero__quick-spec">
      <span className="hero__quick-icon"><QuickIcon icon={icon} /></span>
      <span><small className="sr-only">{label}: </small><strong>{value}</strong></span>
    </span>
  );
}

/**
 * Icon strip with the model's key facts, laid over the hero photo. On model pages it is the only
 * place for these facts (the separate stats row was removed); battery capacity, top speed etc. stay in the spec table.
 */
export function QuickSpecs({ specs }: { specs: Specs }) {
  const motor = motorFact(specs);
  const charge = chargeValue(specs);
  return (
    <div className="hero__quick-specs" aria-label="Загварын шуурхай үзүүлэлтүүд">
      <Item icon="fuel" label="Түлш" value={specs.fuel} />
      <Item icon={specs.drive.toLowerCase()} label="Хөтлөгч" value={specs.drive} />
      <Item icon="range" label={specs.fuel === "BEV" ? "Туулах зай" : "Цахилгаанаар / нийт туулах зай"} value={rangeValue(specs)} />
      {charge && <Item icon="charging" label="Хурдан цэнэглэлт" value={charge} />}
      {motor && <Item icon={motor.icon} label={specs.fuel === "BEV" ? "Моторын хүч" : "Моторын хүч / хөдөлгүүр"} value={motor.value} />}
      <Item icon="dimension" label="Хэмжээ" value={compactSize(specs.size)} />
      <Item icon="doors" label={specs.doorLabel ?? "Хаалганы тоо"} value={countOnly(specs.doors)} />
      <Item
        icon="seats" label="Суудлын тоо"
        value={specs.seatsPassenger ? <T v={{ cargo: countOnly(specs.seats), passenger: countOnly(specs.seatsPassenger) }} /> : countOnly(specs.seats)}
      />
      {payloadValue(specs.payload) && <Item icon="payload" label="Даац" value={payloadValue(specs.payload)} />}
    </div>
  );
}
