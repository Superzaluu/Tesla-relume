import type { QuickSpecs as Specs } from "@/data/types";

const ICONS: Record<string, string> = {
  van: "01_van.png", flatbed: "02_light_flatbed_truck.png", box: "03_light_box_truck.png", refrigerator: "04_refrigerator_truck.png",
  flatbed4: "05_flatbed_4door_truck.png", fwd: "06_FWD.png", awd: "07_AWD.png", rwd: "08_RWD.png", fuel: "09_fuel.png",
  dimension: "10_dimension.png", doors: "11_doors.png",
  charging: "12_charging.png", range: "13_range.png", engine: "14_fuel EREV машинд ашиглах.png", seats: "15_seats.png", payload: "16_payload.svg"
};

function Item({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <span className="hero__quick-spec">
      <span className="hero__quick-icon"><img src={`/assets/icons/${encodeURI(ICONS[icon])}`} alt="" aria-hidden="true" /></span>
      <span><small>{label}</small><strong>{value}</strong></span>
    </span>
  );
}

/** Icon strip with the model's key facts, laid over the hero photo. */
export function QuickSpecs({ specs }: { specs: Specs }) {
  return (
    <div className="hero__quick-specs" aria-label="Загварын шуурхай үзүүлэлтүүд">
      <Item icon={specs.type} label="Загвар" value={specs.label} />
      <Item icon={specs.drive.toLowerCase()} label="Хөтлөгч" value={specs.drive} />
      <Item icon="dimension" label="Хэмжээ" value={specs.size} />
      <Item icon="doors" label={specs.doorLabel ?? "Хаалганы тоо"} value={specs.doors} />
      <Item icon="charging" label="Цэнэглэх хугацаа" value={specs.charge} />
      <Item icon="range" label="Туулах зай" value={specs.range} />
      <Item icon="seats" label="Суудлын тоо" value={specs.seats} />
      <Item icon="payload" label="Даац" value={specs.payload} />
      {specs.fuel && <Item icon="fuel" label="Түлш" value={specs.fuel} />}
      {specs.engine && <Item icon="engine" label="Хөдөлгүүр" value={specs.engine} />}
    </div>
  );
}
