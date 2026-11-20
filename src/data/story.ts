// Picture-and-caption sections for every model page (user, 2026-11-20: "EC75-ын зурагтай тайлбар" + the B′
// spec section = one standard for all models). EC75 and R5 have hand-written sections in code; every other
// model gets the same section types built from its spec sheet, so the text never says more than the sheet.
// Only what the sheet marks or fills in is mentioned; an empty value drops the sentence, card or section.
//
// Photos: each section has a fixed slot. STORY_IMAGES maps a model's slots to files (1200 × 720 JPEG,
// public/assets/models/<family>/story/); any other slot shows the "Coming soon" picture.
import type { Card, Fact, Img, Section } from "./types";
import { aggregate, FIELD, markOf, siteColumns, type SlotSet, type SpecSheet } from "./specSheet";

const COMING_SOON = "/assets/coming-soon.svg";

/** Every listed slot of a family's photo folder, plus the cargo photo for this body. */
const family = (dir: string, slots: Slot[], cargo?: string): Partial<Record<Slot, string>> => ({
  ...Object.fromEntries(slots.map((slot) => [slot, `/assets/models/${dir}/story/${slot}.jpg`])),
  ...(cargo ? { cargo: `/assets/models/${dir}/story/${cargo}.jpg` } : {})
});

// C5 (user approved 2026-11-20): cropped from the rc-ev.com «车型概览» posters, which C5 EV, CNG and EREV share.
// The cargo photo follows the body: single-cab flatbed, double-cab flatbed, or box.
const C5: Slot[] = ["cabin", "chassis", "brakes", "battery", "charging", "adas-acc", "adas-ica", "adas-aeb", "adas-ldw", "adas-ldp",
  "adas-isa", "adas-hma", "safety-camera360", "safety-esc", "safety-tpms", "interior-screen", "interior-seats"];

/** Photo files per model slug and slot. Add a model here after copying its photos. */
export const STORY_IMAGES: Record<string, Partial<Record<Slot, string>>> = {
  c5: family("c5", C5, "cargo"), "c5-cng": family("c5", C5, "cargo"), "c5-reev": family("c5", C5, "cargo"),
  "c5-cng-crew": family("c5", C5, "cargo-crew"), "c5-reev-crew": family("c5", C5, "cargo-crew"), "c5-drone": family("c5", C5, "cargo-crew"),
  "c5-box": family("c5", C5, "cargo-box"), "c5-cng-box": family("c5", C5, "cargo-box"), "c5-reev-box": family("c5", C5, "cargo-box"),
  "c5-cng-crew-box": family("c5", C5, "cargo-box"), "c5-reev-crew-box": family("c5", C5, "cargo-box")
};

/**
 * Captions that go with a family's photos (rc-ev.com poster captions in our words). `text` replaces the card text;
 * "{v}" in it is the value from the spec sheet. "battery-note" is added to the battery paragraph.
 */
type Caption = { title?: string; text: string };
const C5_TEXT: Partial<Record<Slot | "battery-note", Caption>> = {
  cabin: { title: "Тэгш шалтай кабин", text: "{v}. Кабины шал урдаасаа хойш тэгш, нэг болон давхар кабин аль аль нь өргөн." },
  chassis: { title: "Рам ба хойд тэнхлэг", text: "{v}. 2 уртааш, 12 хөндлөн бат бөх ган рам, 3 тонны хойд тэнхлэг — хөнгөн ачааны машины түвшний бүтэц." },
  brakes: { title: "Тоормос", text: "{v}. Цахилгаан удирдлагатай EHB тоормос, агааржуулалттай диск: тоормос миллисекундэд хариу өгнө." },
  "interior-screen": { title: "Дэлгэц ба багажны самбар", text: "{v}. Хэвтээ үргэлжилсэн самбар, гол мэдээлэл нэг харцанд." },
  "interior-seats": { title: "Өргөн кабин, суудал", text: "{v}. 1.8 м өргөн тэгш кабин, үргэлжилсэн суудал." },
  "adas-acc": { text: "0–95 км/ц хурдны бүх мужид урд машиныг дагаж, хурд болон зайгаа барина." },
  "battery-note": { text: "3 давхар дулааны хамгаалалттай, −30°C-аас 65°C хүртэл дулааны удирдлагатай." }
};
export const STORY_TEXT: Record<string, Partial<Record<Slot | "battery-note", Caption>>> =
  Object.fromEntries(Object.keys(STORY_IMAGES).filter((slug) => slug.startsWith("c5")).map((slug) => [slug, C5_TEXT]));

export const STORY_SLOTS = ["cargo", "rear-door", "side-door", "floor", "cabin", "chassis", "brakes", "tyres", "battery", "charging",
  "adas-acc", "adas-ica", "adas-aeb", "adas-fcw", "adas-ldw", "adas-ldp", "adas-isa", "adas-dms", "adas-hma",
  "safety-esc", "safety-autohold", "safety-tpms", "safety-camera360", "interior-cluster", "interior-screen", "interior-seats", "interior-ac", "interior-start"] as const;
type Slot = (typeof STORY_SLOTS)[number];

const ADAS_NOTE = "Жолоочийн туслах системүүд нь жолоочийг орлохгүй. Жолооч замын нөхцөлд үргэлж анхаарал хандуулж, машинаа бүрэн хянах ёстой. Мөс, цас, бороо, үзэгдэх орчин муу үед болгоомжтой яваарай.";

const CARGO_TEXT: Record<SlotSet, { tagline: string; title: string; noun: string }> = {
  flatbed: { tagline: "Тэвш", title: "Ачаандаа зориулсан тэвш", noun: "тэвш" },
  box: { tagline: "Хайрцаг", title: "Ачааг хамгаалсан хайрцаг", noun: "хайрцаг" },
  refrigerated: { tagline: "Хөргүүртэй хайрцаг", title: "Хүнс, эмийг хүйтэнд нь хүргэнэ", noun: "хөргүүртэй хайрцаг" },
  "cargo-van": { tagline: "Ачааны тасалгаа", title: "Ачаа их, зардал бага", noun: "ачааны тасалгаа" },
  passenger: { tagline: "Зорчигчийн салон", title: "Олон хүнийг эвтэйхэн", noun: "салон" },
  special: { tagline: "Ачааны хэсэг", title: "Тусгай ажилд бэлэн", noun: "ачааны хэсэг" }
};

const ADAS: { key: string; slot: Slot; name: string; code: string; text: string }[] = [
  { key: "acc", slot: "adas-acc", name: "Дасан зохицох круиз контрол", code: "ACC", text: "Урд машиныг автоматаар дагаж, хурд болон зайгаа барина." },
  { key: "ica", slot: "adas-ica", name: "Нэгдсэн круиз", code: "TJA/ICA", text: "Түгжрэл болон хурдны замд эгнээндээ урд машиныг дагаж, жолоочийн ядаргааг бууруулна." },
  { key: "aeb", slot: "adas-aeb", name: "Яаралтай автомат тоормос", code: "AEB", text: "Урд талын зайг хянаж, мөргөлдөх эрсдэлтэй үед автоматаар тоормослоно." },
  { key: "fcw", slot: "adas-fcw", name: "Мөргөлдөх анхааруулга", code: "FCW", text: "Урд машин руу хэт ойртоход дуут дохио, дэлгэцээр анхааруулна." },
  { key: "ldw", slot: "adas-ldw", name: "Эгнээнээс гарах анхааруулга", code: "LDW", text: "Эгнээг тасралтгүй хянаж, эгнээнээс гарахад даруй анхааруулна." },
  { key: "ldp", slot: "adas-ldp", name: "Эгнээ хадгалах туслах", code: "LDP", text: "Санамсаргүй эгнээнээс гарах үед жолоог залруулж эгнээнд нь буцаана." },
  { key: "isa", slot: "adas-isa", name: "Ухаалаг хурд хязгаарлагч", code: "ISA", text: "Хурдны хязгаарын тэмдгийг таньж, хэтрүүлэхгүй байхыг сануулна." },
  { key: "dms", slot: "adas-dms", name: "Жолоочийн ядаргааны хяналт", code: "DMS", text: "Камераар жолоочийн ядаргаа, анхаарал сарнихыг хянаж сануулна." },
  { key: "hma", slot: "adas-hma", name: "Ухаалаг гэрэл", code: "HMA", text: "Эсрэг ирж буй машинд холын гэрлээ автоматаар бууруулна." }
];

const SAFETY_CARDS: { key: string; slot: Slot; title: string; tag: string; text: string }[] = [
  { key: "esc", slot: "safety-esc", title: "Тогтвортой байдлын систем", tag: "ESC", text: "Огцом эргэлт, хальтиргаатай замд гулгахаас сэргийлнэ." },
  { key: "autohold", slot: "safety-autohold", title: "Тоормос автоматаар барих", tag: "AUTO HOLD", text: "Гэрлэн дохион дээр тоормос дарахгүйгээр зогсож байна." },
  { key: "tpms", slot: "safety-tpms", title: "Дугуйн даралтын хяналт", tag: "TPMS", text: "Дугуй бүрийн даралтыг бодит цагт хянана." },
  { key: "camera360", slot: "safety-camera360", title: "360° камер", tag: "360°", text: "Машиныг тойрсон орчныг дээрээс нь харж, давчуу газар амархан зогсооно." }
];

const CONNECTED: { key: string; title: string; text: string }[] = [
  { key: "app", title: "Апп-аар удирдах", text: "Утаснаасаа машинаа алсаас удирдана." },
  { key: "ota", title: "Алсын шинэчлэлт (OTA)", text: "Програм хангамж утасгүй шинэчлэгдэнэ." },
  { key: "connected", title: "Интернэт холболт", text: "Машины мэдээлэл үргэлж гарт тань." },
  { key: "bluetooth", title: "Bluetooth", text: "Утсаа холбож дуудлага, хөгжмөө удирдана." },
  { key: "12v", title: "Ухаалаг 12V цэнэглэлт", text: "Туслах аккумляторыг автоматаар цэнэглэнэ." }
];

const DRIVE_TEXT: Record<string, string> = { FWD: "урд дугуйг хөтөлнө", RWD: "хойд дугуйг хөтөлнө", AWD: "бүх дугуйг хөтөлнө" };

const sentence = (text: string) => (text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}${/[.!?]$/.test(text) ? "" : "."}` : "");
const thousands = (text: string) => text.replace(/\d{4,}/g, (n) => Number(n).toLocaleString("en-US"));
/** "LFP (Lithium Iron Phosphate, литийн төмрийн фосфат)" → "LFP"; the explanation goes into the sentence. */
const plain = (text: string) => text.replace(/\s*\([^)]*\)/g, "").trim();

export function buildStory(sheet: SpecSheet, name: string, slug: string, fuel: string | undefined, slotSet: SlotSet, noteCount: number):
  { sections: Section[]; notes: string[] } {
  const cols = siteColumns(sheet);
  if (cols.length === 0) return { sections: [], notes: [] };
  const raw = (key: string) => cols.map((i) => sheet.values[key]?.[i] ?? "");
  const val = (key: string) => (FIELD[key] ? aggregate(FIELD[key], raw(key)) : "");
  /** "all": standard on every trim shown, "some": on some of them, "": nowhere. */
  const has = (key: string) => {
    const marks = raw(key).map(markOf);
    return marks.every((mark) => mark === "●") ? "all" : marks.some((mark) => mark === "●") ? "some" : "";
  };
  const image = (slot: Slot, alt: string): Img => {
    const file = STORY_IMAGES[slug]?.[slot];
    return file
      ? { src: file, width: 1200, height: 720, alt: `${name} — ${alt}` }
      : { src: COMING_SOON, width: 1200, height: 720, alt: `${name} — ${alt} (зураг удахгүй нэмэгдэнэ)` };
  };
  const facts = (list: [string, string][]): Fact[] => list.filter(([, value]) => value).slice(0, 3).map(([label, value]) => ({ label, value }));
  // Marks inside a sentence read as words: "2 хаалга / ○ 4 хаалга" → "2 хаалга / нэмэлт сонголтоор 4 хаалга".
  const words_ = (text: string) => text.replace(/○\s*/g, "нэмэлт сонголтоор ").replace(/●\s*/g, "");
  const captions = STORY_TEXT[slug] ?? {};
  const card = (slot: Slot, title: string, text: string, tag?: string): Card => {
    const caption = captions[slot];
    const heading = caption?.title ?? title;
    const body = caption ? caption.text.replace(/\{v\}\.?\s*/, text ? `${words_(text).replace(/\.$/, "")}. ` : "") : words_(text);
    return { image: image(slot, heading), title: heading, text: sentence(body), tag };
  };
  // A model with its own photo set shows only cards that have a photo; the rest stay in the spec section.
  // Models without photos keep the "Coming soon" cards as placeholders.
  const photoSet = Boolean(STORY_IMAGES[slug]);
  const pictured = (img: Img) => !photoSet || img.src !== COMING_SOON;

  const sections: Section[] = [];
  const notes: string[] = [];
  const extender = fuel !== undefined && fuel !== "BEV";

  // 1. Cargo space (or passenger room).
  const words = CARGO_TEXT[slotSet];
  const cargo = val("cargo_size"), volume = val("cargo_volume"), payload = thousands(val("payload"));
  const seats = val("seats"), layout = val("seat_layout");
  const cargoText = [
    slotSet === "passenger"
      ? seats && `${seats} суудалтай${layout ? ` (${layout})` : ""} салон`
      : cargo ? `${words.noun} нь ${cargo}${volume ? `, ${volume} багтаамжтай` : ""}` : volume && `${words.noun} нь ${volume} багтаамжтай`,
    payload && `${payload} хүртэл ачаа даана`,
    val("fridge_temp") && `хөргөлтийн хэм ${val("fridge_temp")}`
  ].filter(Boolean).map((text) => sentence(text as string)).join(" ");
  if (cargoText) {
    sections.push({ id: "cargo-space", blocks: [{
      type: "feature", image: image("cargo", words.tagline), tagline: words.tagline, title: words.title, text: cargoText,
      facts: facts([["Тэнхлэг хоорондын зай", val("wheelbase")], ["Гадна хэмжээ", val("size")], ["Ачааны шал", val("cargo_floor")]])
    }] });
  }

  // 2. Built for work: cabin, doors, floor and chassis as picture cards.
  const cabin = val("cabin");
  const workCards = [
    (cabin || seats) && card("cabin", "Кабин", [cabin, seats && `${seats} суудал`].filter(Boolean).join(", ")),
    val("rear_door") && card("rear-door", "Арын хаалга", val("rear_door")),
    val("side_doors") && card("side-door", "Хажуугийн хаалга", val("side_doors")),
    val("cargo_floor") && card("floor", "Ачааны шал", val("cargo_floor")),
    val("rear_susp") && card("chassis", "Хойд тэнхлэг", val("rear_susp")),
    val("brakes") && card("brakes", "Тоормос", val("brakes")),
    val("tyres") && card("tyres", "Дугуй", val("tyres"))
  ].filter((item): item is Card => Boolean(item) && pictured((item as Card).image)).slice(0, 4);
  if (workCards.length >= 3) {
    sections.push({ tone: "tight", blocks: [
      { type: "title", title: "Ажилд зориулсан бүтэц", text: "Өдөр тутмын ажилд зориулсан хийц." },
      { type: "cards", items: workCards }
    ] });
  }

  // 3. Battery and motor.
  const kwh = val("battery_kwh"), type = val("battery_type"), cooling = val("battery_cooling");
  const chem = /LFP/.test(type) ? "литийн төмрийн фосфат (LFP)" : plain(type);
  const coolText = /шингэн/i.test(cooling) ? "шингэн хөргөлттэй" : /агаар/i.test(cooling) ? "агаарын хөргөлттэй" : "";
  const power = val("power");
  const drives = [...new Set(raw("drive").filter(Boolean))];
  const driveText = drives.length === 1 ? DRIVE_TEXT[drives[0]] ?? "" : "";
  const engine = val("engine_model"), total = thousands(val("total_range"));
  const batteryText = [
    kwh && `${kwh} багтаамжтай${coolText ? `, ${coolText}` : ""}${chem ? ` ${chem}` : ""} батерей`,
    power && (driveText ? `${power} оргил чадалтай мотор ${driveText}` : `моторын оргил чадал ${power}`),
    extender && engine && `${plain(engine)} зай сунгагч батерейг замдаа цэнэглэж${total ? `, нийт ${total} явна` : " явна"}`,
    kwh && captions["battery-note"]?.text
  ].filter(Boolean).map((text) => sentence(text as string)).join(" ");
  const stds = [...new Set(raw("range_std").filter(Boolean))];
  const rangeLabel = `${extender ? "Цахилгаанаар" : "Туулах зай"}${stds.length === 1 ? ` (${stds[0]})` : ""}`;
  if (batteryText) {
    sections.push({ id: "battery", tone: "dark", blocks: [{
      type: "feature", reverse: true, image: image("battery", "батерей ба мотор"),
      tagline: "Хүч ба зай", title: extender ? "Ойрдоо цахилгаанаар, холдоо зай сунгагчтай" : "Өдөржин ажиллах хүч", text: batteryText,
      facts: facts([...(extender ? [["Нийт туулах зай", total] as [string, string]] : []), [rangeLabel, val("range")], ["Эргэх момент", val("torque")], ["Дээд хурд", val("top_speed")]])
    }] });
  }

  // 4. Charging.
  const dc = val("dc_time"), acTime = val("ac_time"), acPower = val("ac_power"), rate = val("charge_rate");
  const rateTimes = rate.match(/(\d+(?:\.\d+)?)\s*C/i)?.[1];
  const columns = [
    dc && { value: dc, title: "Хурдан цэнэглэлт", text: `Хурдан (DC) цэнэглэгчээр ${dc.replace(/\s*мин$/, " минутад")} 80% хүртэл цэнэглэнэ.` },
    (acTime || acPower) && {
      value: acPower || acTime, title: "Гэр, агуулахдаа",
      text: acTime ? `Удаан (AC) цэнэглэгчээр ${acTime.replace(/\s*цаг$/, " цагт")} бүрэн цэнэглэнэ.` : `${acPower} чадалтай удаан (AC) цэнэглэгчээр шөнөжин цэнэглэнэ.`
    },
    has("v2l") && { value: "V2L", title: "Цахилгаан хуваалцах", text: `Машины батерейгаас гадны багаж, төхөөрөмжөө тэжээнэ.${has("v2l") === "some" ? " Зарим иж бүрдэлд." : ""}` },
    rateTimes && { value: `${rateTimes}C`, title: "Цэнэглэх чадал", text: `Батерейн багтаамжаас ${rateTimes} дахин их чадлаар цэнэглэнэ.` }
  ].filter((item): item is { value: string; title: string; text: string } => Boolean(item)).slice(0, 3);
  if (columns.length >= 2) {
    sections.push({ id: "charging", blocks: [
      { type: "title", tagline: "Цэнэглэлт", title: "Хурдан, хаана ч цэнэглэнэ" },
      { type: "wideImage", image: image("charging", "цэнэглэлт") },
      { type: "columns", items: columns }
    ] });
  }

  // 5. Driver assistance: only systems the sheet marks as standard on at least one trim.
  const adas = ADAS.filter((item) => has(item.key) && !(item.key === "fcw" && has("aeb")))
    .map((item) => ({
      id: item.key, name: item.name, code: item.key === "aeb" && has("fcw") ? "AEB · FCW" : item.code,
      text: `${captions[item.slot]?.text ?? item.text}${has(item.key) === "some" ? " Зарим иж бүрдэлд." : ""}`, image: image(item.slot, `${item.name} (${item.code})`)
    }))
    .filter((item) => pictured(item.image));
  if (adas.length >= 2) {
    notes.push(ADAS_NOTE);
    sections.push({ id: "assist", blocks: [
      { type: "title", tagline: "Жолоодлогын туслах систем (ADAS)", title: `Жолоочийн ${adas.length} туслах функц`, text: "Камер болон радарт тулгуурласан туслах системүүд аялал бүрийг аюулгүй, ядаргаа багатай болгоно.", note: noteCount + notes.length },
      { type: "adas", items: adas }
    ] });
  }

  // 6. Safety: picture cards for the main systems, the rest as chips (standard on every trim only).
  // As in ADAS: a system on some trims only still gets its card, marked "Зарим иж бүрдэлд".
  const safetyItems = SAFETY_CARDS.filter((item) => has(item.key))
    .map((item) => ({ key: item.key, card: card(item.slot, item.title, `${item.text}${has(item.key) === "some" ? " Зарим иж бүрдэлд." : ""}`, item.tag) }))
    .filter((item) => pictured(item.card.image));
  const safetyCards = safetyItems.map((item) => item.card);
  // A system without a card (no photo) is listed with the chips instead.
  const cardKeys = new Set(safetyItems.map((item) => item.key));
  const chips = Object.values(FIELD).filter((field) => field.group === "safety" && field.kind === "mark" && !field.hidden && !cardKeys.has(field.key) && has(field.key) === "all")
    .map((field) => field.short ?? plain(field.label));
  if (safetyCards.length > 0 || chips.length >= 3) {
    sections.push({ id: "safety", tone: "surface", blocks: [
      { type: "title", tagline: "Аюулгүй байдал", title: "Зам дээр тогтвортой" },
      { type: "safety", items: safetyCards, chipsTitle: cols.length > 1 ? "Бүх иж бүрдэлд стандартаар" : "Стандартаар", chips }
    ] });
  }

  // 7. Cabin: picture cards for what the sheet fills in, then the connected features.
  const interior = [
    val("cluster") && card("interior-cluster", "Багажны самбар", val("cluster")),
    val("screen") && card("interior-screen", "Төв дэлгэц, аудио", val("screen")),
    val("seat_material") && card("interior-seats", "Суудал", val("seat_material")),
    has("ac") && card("interior-ac", "Агааржуулагч", val("ac_control") || "Стандартаар"),
    val("start") && card("interior-start", "Асаалт", val("start"))
  ].filter((item): item is Card => Boolean(item) && pictured((item as Card).image)).slice(0, 4);
  const connected = CONNECTED.filter((item) => has(item.key)).map(({ title, text }) => ({ title, text: `${text}${has(CONNECTED.find((c) => c.title === title)!.key) === "some" ? " Зарим иж бүрдэлд." : ""}` }));
  if (interior.length >= 2 || connected.length >= 2) {
    sections.push({ id: "interior", blocks: [
      { type: "title", tagline: "Кабин", title: "Жолоочид зориулсан кабин", text: "Энгийн, ойлгомжтой удирдлага бүхий кабин." },
      ...(interior.length >= 2 ? [{ type: "cards" as const, items: interior }] : []),
      ...(connected.length >= 2 ? [{ type: "connected" as const, items: connected }] : [])
    ] });
  }

  return { sections, notes };
}
