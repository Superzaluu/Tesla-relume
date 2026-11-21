// Picture-and-caption sections for every model page (user, 2026-11-20: "EC75-ын зурагтай тайлбар" + the B′
// spec section = one standard for all models). EC75 and R5 have hand-written sections in code; every other
// model gets the same section types built from its spec sheet, so the text never says more than the sheet.
// Only what the sheet marks or fills in is mentioned; an empty value drops the sentence, card or section.
//
// Photos: each section has a fixed slot. STORY_IMAGES maps a model's slots to files (1200 × 720 JPEG,
// public/assets/models/<family>/story/); any other slot shows the "Coming soon" picture.
import type { Card, Fact, Img, Peek, PeekKey, Section } from "./types";
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

const C5_SINGLE_BOX: Partial<Record<Slot, string>> = { ...family("c5", C5), cargo: "/assets/models/c5l/album/side.jpg" };

/** Photo files per model slug and slot. Add a model here after copying its photos. */
export const STORY_IMAGES: Record<string, Partial<Record<Slot, string>>> = {
  c5: family("c5", C5, "cargo"), "c5-cng": family("c5", C5, "cargo"), "c5-reev": family("c5", C5, "cargo"),
  "c5-cng-crew": family("c5", C5, "cargo-crew"), "c5-reev-crew": family("c5", C5, "cargo-crew"), "c5-drone": family("c5", C5, "cargo-crew"),
  // Single-cab box = the C5L box truck (user, 2026-11-21): its side photo, not the double-cab box.
  "c5-box": C5_SINGLE_BOX, "c5-cng-box": C5_SINGLE_BOX, "c5-reev-box": C5_SINGLE_BOX,
  "c5-cng-crew-box": family("c5", C5, "cargo-box"), "c5-reev-crew-box": family("c5", C5, "cargo-box")
};

/**
 * Models with only SOME photos so far (2026-11-20). These slots show their photo; every other slot keeps its
 * text card, so no section drops out. Cut from the model's rc-ev.com «车型概览» poster with none of its Chinese
 * text, only pictures of this body (no cargo-van photo on the passenger page). Move a model to STORY_IMAGES once
 * it has the whole set. ED71S, C3 cold, R5 service and the single-cab C5 box have no poster photos on rc-ev.com.
 */
const C3: Slot[] = ["battery", "brakes", "cabin", "interior-screen", "interior-cluster", "safety-autohold", "adas-acc", "adas-dms",
  "safety-camera360", "safety-tpms"];
const STORY_SOME: Record<string, Partial<Record<Slot, string>>> = {
  "ec75pro-passenger": family("ec75pro-passenger", ["battery", "chassis", "interior-screen", "interior-cluster"]),
  // EC75 Pro Cargo: clean, text-free derivatives from the supplied product sheet.
  // Versioned filenames deliberately make browsers request the new assets instead of reusing an image cache.
  "ec75pro-cargo": {
    cargo: "/assets/models/ec75pro-cargo/story/cargo-clean.jpg",
    battery: "/assets/models/ec75pro-cargo/story/battery-clean.jpg",
    chassis: "/assets/models/ec75pro-cargo/story/chassis-clean.jpg",
    "interior-screen": "/assets/models/ec75pro-cargo/story/interior-screen-clean.jpg",
    "interior-cluster": "/assets/models/ec75pro-cargo/story/interior-cluster-clean.jpg"
  },
  "r5pro-cargo": {
    ...family("r5pro-cargo", ["cargo", "battery", "chassis"]),
    "cabin": "/assets/r5/cockpit.jpg",
    "side-door": "/assets/r5/cargo-side-door.jpg",
    "rear-door": "/assets/r5/cargo-rear.jpg",
    "interior-screen": "/assets/models/r5pro-cargo/story/interior-screen-clean.png",
    // R5 Pro Cargo follows the same nine-card safety layout as the R5 Cargo page.
    "adas-acc": "/assets/r5/adas-acc.jpg",
    "adas-ica": "/assets/r5/adas-ica.jpg",
    "adas-aeb": "/assets/r5/adas-aeb.jpg",
    "adas-ldw": "/assets/r5/adas-ldw.jpg",
    "adas-isa": "/assets/r5/adas-isa.jpg",
    "adas-hma": "/assets/r5/adas-hma.jpg",
    "safety-esc": "/assets/r5/safety-esc.jpg",
    "safety-autohold": "/assets/r5/safety-autohold.jpg",
    "safety-tpms": "/assets/r5/safety-tpms.jpg"
  },
  "r5pro-passenger": family("r5pro-passenger", ["battery", "chassis", "interior-screen"]),
  c3: family("c3", ["cargo", ...C3]),
  // Same truck with a refrigerated body: the cab, chassis and electronics photos are true for it, the flatbed is not.
  // Cargo: rc-ev.com's own C3 冷藏 studio photo (menu image, 640×310 on white), 2026-11-20.
  "c3-cold": family("c3", C3, "cargo-cold"),
  // Cabin + seats: rc-ev.com C5L «精彩图集» studio photos (full size via an exporter's copy), 2026-11-21.
  c5l: family("c5l", ["cargo", "cabin", "chassis", "battery", "interior-seats"]),
  c9: family("c9", ["cargo", "cabin", "chassis", "brakes", "battery", "interior-screen", "interior-cluster"]),
  ec31: family("ec31", ["cargo", "cabin"]),
  ec31l: family("ec31l", ["cargo", "cabin"]),
  ec31s: family("ec31s", ["cargo", "cabin"]),
  ec35: family("ec35", ["cargo", "interior-seats"]),
  // ED71S is the C5 BEV with leaf springs front and rear (user, 2026-11-20): the C5's cab, battery, interior and
  // flatbed photos are true for it; the chassis and brake (suspension) photos are not.
  // Cargo: its own rc-ev.com studio photo (ED71S plate) instead of the C5's.
  ed71s: { ...family("c5", C5.filter((slot) => slot !== "chassis" && slot !== "brakes")), cargo: "/assets/models/ed71s/story/cargo.jpg" }
};
const photosOf = (slug: string) => STORY_IMAGES[slug] ?? STORY_SOME[slug];

/**
 * Captions that go with a family's photos (rc-ev.com poster captions in our words). `text` replaces the card text;
 * "{v}" in it is the value from the spec sheet. "battery-note" is added to the battery paragraph.
 */
type Caption = { title?: string; text: string };
const C5_TEXT: Partial<Record<Slot | "battery-note", Caption>> = {
  cabin: { title: "Тэгш шалтай кабин", text: "{v}. Кабины шал урдаасаа хойш тэгш, нэг болон давхар кабин аль аль нь өргөн." },
  chassis: { title: "Рам ба хойд тэнхлэг", text: "{v}. 2 уртааш, 12 хөндлөн бат бөх ган рам, 3 тонны хойд тэнхлэг — хөнгөн ачааны машины түвшний бүтэц." },
  brakes: { title: "Тоормос", text: "{v}. Цахилгаан удирдлагатай EHB тоормос, агааржуулалттай диск: тоормос миллисекундэд хариу өгнө." },
  "interior-screen": { title: "Дэлгэц ба хянах самбар", text: "{v}. Хэвтээ үргэлжилсэн самбар, гол мэдээлэл нэг харцанд." },
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

const DRIVE_TEXT: Record<string, string> = { FWD: "урд дугуйг хөтөлнө", RWD: "хойд дугуйг хөтөлнө", AWD: "бүх дугуйг хөтөлнө" };

const sentence = (text: string) => (text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}${/[.!?]$/.test(text) ? "" : "."}` : "");
const thousands = (text: string) => text.replace(/\d{4,}/g, (n) => Number(n).toLocaleString("en-US"));
/** "LFP (Lithium Iron Phosphate, литийн төмрийн фосфат)" → "LFP"; the explanation goes into the sentence. */
const plain = (text: string) => text.replace(/\s*\([^)]*\)/g, "").trim();

// Hero icon → the story photos it previews, best first (user, 2026-11-20: variant B «Урьдчилан харах»).
// C5 has no motor or door photo of its own, so those fall back to the battery and cabin photos.
const PEEK_SLOTS: Record<PeekKey, Slot[]> = {
  fuel: ["battery"], drive: ["chassis"], range: ["battery"], charging: ["charging", "battery"], motor: ["battery"],
  dimension: ["cargo"], doors: ["cabin", "side-door", "rear-door"], seats: ["interior-seats", "cabin"], payload: ["cargo", "chassis"]
};

const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
const str = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * Photo previews for the hero icons, taken from the sections actually on the page: a photo that is
 * not shown below gets no preview. Story cards get an id here so a preview can jump to the card itself.
 */
function collectPeeks(sections: Section[], slug: string): Partial<Record<PeekKey, Peek>> {
  const files = photosOf(slug);
  if (!files) return {};
  const slotOf = new Map(Object.entries(files).map(([slot, file]) => [file as string, slot as Slot]));
  const found = new Map<Slot, Peek>();
  const add = (src: unknown, peek: () => Omit<Peek, "src">) => {
    const slot = slotOf.get(str(src));
    if (slot && !found.has(slot)) found.set(slot, { src: str(src), ...peek() });
    return slot;
  };
  for (const section of sections) {
    const heading = section.blocks.find((block) => block.type === "title");
    const sectionTitle = heading?.type === "title" ? heading.title : "";
    for (const block of section.blocks) {
      if (block.type === "feature" && block.image && section.id) {
        add(block.image.src, () => ({ title: str(block.title), text: firstSentence(str(block.text)), href: `#${section.id}` }));
      } else if (block.type === "wideImage" && section.id) {
        const columns = section.blocks.find((other) => other.type === "columns");
        add(block.image.src, () => ({ title: sectionTitle, text: columns?.type === "columns" ? columns.items[0]?.text ?? "" : "", href: `#${section.id}` }));
      } else if (block.type === "cards" || block.type === "safety") {
        for (const card of block.items) {
          const slot = slotOf.get(str(card.image.src));
          if (!slot) continue;
          card.id = `story-${slot}`;
          add(card.image.src, () => ({ title: card.title, text: firstSentence(card.text), href: `#story-${slot}` }));
        }
      }
    }
  }
  const peeks: Partial<Record<PeekKey, Peek>> = {};
  for (const [key, slots] of Object.entries(PEEK_SLOTS) as [PeekKey, Slot[]][]) {
    const slot = slots.find((candidate) => found.has(candidate));
    if (slot) peeks[key] = found.get(slot);
  }
  return peeks;
}

/**
 * Previews for the hero icons of a page whose sections are written by hand (EC75 / R5, src/data/ec75.ts, r5.ts):
 * there are no story slots, so each icon takes the first picture of the section that is about it, matched by
 * section id and, for cards, by words in the card title (user, 2026-11-21: the icons did nothing on EC75 / R5).
 * A card that becomes a target gets an id, so the preview jumps to that card (e.g. seats → the cabin card in
 * «Аюулгүй ба ухаалаг»). Variant pictures and texts use the cargo side.
 */
export function peeksFromSections(sections: Section[]): Partial<Record<PeekKey, Peek>> {
  const side = <T,>(value: T | { cargo: T; passenger: T } | undefined): T | undefined =>
    value && typeof value === "object" && "cargo" in (value as object) ? (value as { cargo: T }).cargo : (value as T | undefined);
  const byId = (...ids: string[]): Peek | undefined => {
    for (const id of ids) {
      const section = sections.find((item) => item.id === id);
      if (!section) continue;
      const heading = section.blocks.find((block) => block.type === "title");
      for (const block of section.blocks) {
        if (block.type === "feature" && block.image) {
          return { src: str(side(block.image.src)), title: str(side(block.title)), text: firstSentence(str(side(block.text))), href: `#${id}` };
        }
        if (block.type === "wideImage") {
          const columns = section.blocks.find((other) => other.type === "columns");
          return {
            src: str(side(block.image.src)), title: heading?.type === "title" ? str(side(heading.title)) : "",
            text: columns?.type === "columns" ? columns.items[0]?.text ?? "" : "", href: `#${id}`
          };
        }
      }
    }
    return undefined;
  };
  const byCard = (key: string, words: RegExp): Peek | undefined => {
    for (const section of sections) {
      for (const block of section.blocks) {
        if (block.type !== "cards" && block.type !== "safety") continue;
        const card = block.items.find((item) => words.test(str(side(item.title))) && item.image);
        if (!card) continue;
        card.id ??= `story-${key}`;
        return { src: str(side(card.image.src)), title: str(side(card.title)), text: firstSentence(str(side(card.text))), href: `#${card.id}` };
      }
    }
    return undefined;
  };
  const battery = byId("battery");
  const cargo = byId("cargo-space", "space");
  const peeks: Partial<Record<PeekKey, Peek | undefined>> = {
    fuel: battery, range: battery, motor: battery, drive: battery,
    charging: byId("charging") ?? battery,
    dimension: cargo, payload: cargo,
    doors: byCard("doors", /хаалга/i),
    seats: byCard("seats", /суудал/i) ?? cargo
  };
  return Object.fromEntries(Object.entries(peeks).filter(([, peek]) => peek?.src)) as Partial<Record<PeekKey, Peek>>;
}

export function buildStory(sheet: SpecSheet, name: string, slug: string, fuel: string | undefined, slotSet: SlotSet, noteCount: number):
  { sections: Section[]; notes: string[]; peeks: Partial<Record<PeekKey, Peek>> } {
  const cols = siteColumns(sheet);
  if (cols.length === 0) return { sections: [], notes: [], peeks: {} };
  const raw = (key: string) => cols.map((i) => sheet.values[key]?.[i] ?? "");
  const val = (key: string) => (FIELD[key] ? aggregate(FIELD[key], raw(key)) : "");
  /** "all": standard on every trim shown, "some": on some of them, "": nowhere. */
  const has = (key: string) => {
    const marks = raw(key).map(markOf);
    return marks.every((mark) => mark === "●") ? "all" : marks.some((mark) => mark === "●") ? "some" : "";
  };
  const image = (slot: Slot, alt: string): Img => {
    const file = photosOf(slug)?.[slot];
    return file
      ? { src: file, width: 1200, height: 720, alt: `${name} — ${alt}` }
      : { src: COMING_SOON, width: 1200, height: 720, alt: `${name} — ${alt} (зураг удахгүй нэмэгдэнэ)` };
  };
  const facts = (list: [string, string][]): Fact[] => list.filter(([, value]) => value).slice(0, 3).map(([label, value]) => ({ label, value }));
  // Marks inside a sentence read as words: "2 хаалга / ○ 4 хаалга" → "2 хаалга / нэмэлт сонголтоор 4 хаалга".
  const words_ = (text: string) => text.replace(/○\s*/g, "нэмэлт сонголтоор ").replace(/●\s*/g, "");
  const captions = STORY_TEXT[slug] ?? {};
  const isR5ProCargo = slug === "r5pro-cargo";
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
  // Some photos only (STORY_SOME): cards with a photo first, so a row starts with pictures, then text cards.
  const photoFirst = (a: Card, b: Card) => Number(b.image.src !== COMING_SOON) - Number(a.image.src !== COMING_SOON);

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
  const workCards = isR5ProCargo ? [
    card("side-door", "Хажуугийн гулсдаг хаалга", "Гулсдаг хажуу хаалгаар ачааны тасалгаанд хялбар нэвтэрч, ачих буулгах ажлыг хурдан хийнэ."),
    card("rear-door", "180° арын хаалга", "Арын хаалга бүрэн нээгдэж, ачааны тасалгаанд шууд хандана."),
    card("cabin", "Жолоочийн кабин", "2 суудалтай, тод дэлгэц ба энгийн удирдлагатай кабин.")
  ] : [
    (cabin || seats) && card("cabin", "Кабин", [cabin, seats && `${seats} суудал`].filter(Boolean).join(", ")),
    val("rear_door") && card("rear-door", "Арын хаалга", val("rear_door")),
    val("side_doors") && card("side-door", "Хажуугийн хаалга", val("side_doors")),
    val("cargo_floor") && card("floor", "Ачааны шал", val("cargo_floor")),
    val("rear_susp") && card("chassis", "Хойд тэнхлэг", val("rear_susp")),
    val("brakes") && card("brakes", "Тоормос", val("brakes")),
    val("tyres") && card("tyres", "Дугуй", val("tyres"))
  ].filter((item): item is Card => Boolean(item) && pictured((item as Card).image)).sort(photoFirst).slice(0, 4);
  if (workCards.length >= 3) {
    sections.push({ id: "work", tone: "tight", blocks: [
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
  // Keep this chapter visually identical to R5 Cargo: six driver-assistance cards,
  // then three safety cards. Other equipment remains in the specification table.
  const adasSource: typeof ADAS = isR5ProCargo ? [
    { key: "acc", slot: "adas-acc", name: "Дасан зохицох круиз контрол", code: "ACC", text: "Урд машиныг автоматаар дагаж, хурд болон зайгаа барина." },
    { key: "ica", slot: "adas-ica", name: "Нэгдсэн круиз", code: "TJA/ICA", text: "Түгжрэл болон хурдны замд эгнээндээ урд машиныг дагаж, жолоочийн ядаргааг бууруулна." },
    { key: "aeb", slot: "adas-aeb", name: "Яаралтай автомат тоормос", code: "AEB", text: "Урд талын зайг хянаж, мөргөлдөх эрсдэлтэй үед автоматаар тоормослоно." },
    { key: "ldw", slot: "adas-ldw", name: "Эгнээ хадгалах туслах", code: "LDW · LDP", text: "Эгнээг тасралтгүй хянаж, эгнээнээс гарахад анхааруулж, жолоодлогыг дэмжинэ." },
    { key: "isa", slot: "adas-isa", name: "Ухаалаг хурд хязгаарлагч", code: "ISA", text: "Хурдны хязгаарын тэмдгийг таньж, хэтрүүлэхгүй байхыг сануулна." },
    { key: "hma", slot: "adas-hma", name: "Ухаалаг гэрэл", code: "HMA", text: "Эсрэг ирж буй машинд холын гэрлээ автоматаар бууруулна." }
  ] : ADAS.filter((item) => has(item.key) && !(item.key === "fcw" && has("aeb")));
  const adas = adasSource
    .map((item) => ({
      id: item.key, name: item.name, code: item.key === "aeb" && has("fcw") ? "AEB · FCW" : item.code,
      text: `${captions[item.slot]?.text ?? item.text}${!isR5ProCargo && has(item.key) === "some" ? " Зарим иж бүрдэлд." : ""}`, image: image(item.slot, `${item.name} (${item.code})`)
    }))
    .filter((item) => pictured(item.image));
  if (adas.length >= 2) {
    notes.push(ADAS_NOTE);
    sections.push({ id: "assist", blocks: [
      { type: "title", tagline: "Жолоодлогын туслах систем (ADAS)", title: `Жолоочийн ${adas.length} туслах функц`, text: "Камер болон радарт тулгуурласан туслах системүүд аялал бүрийг аюулгүй, ядаргаа багатай болгоно.", note: noteCount + notes.length },
      { type: "adas", items: adas }
    ] });
  }

  // 6. Safety: picture cards for the main systems. As in ADAS: a system on some trims only still gets its
  // card, marked "Зарим иж бүрдэлд". The other systems are in the «Тоноглол» chips of the spec section; the
  // "Бүх иж бүрдэлд стандартаар" chips that used to follow the cards repeated them (user, 2026-11-20).
  const safetySource = isR5ProCargo
    ? SAFETY_CARDS.filter((item) => ["esc", "autohold", "tpms"].includes(item.key))
    : SAFETY_CARDS.filter((item) => has(item.key));
  const safetyCards = safetySource
    .map((item) => card(item.slot, item.title, `${item.text}${!isR5ProCargo && has(item.key) === "some" ? " Зарим иж бүрдэлд." : ""}`, item.tag))
    .filter((item) => pictured(item.image));
  if (safetyCards.length > 0) {
    sections.push({ id: "safety", tone: "surface", blocks: [
      { type: "title", tagline: "Аюулгүй байдал", title: "Зам дээр тогтвортой" },
      { type: "safety", items: safetyCards }
    ] });
  }

  // 7. Cabin: picture cards for what the sheet fills in. The connected features (app, OTA, internet, Bluetooth,
  // 12V) that used to follow are «Тоноглол» chips in the spec section (user, 2026-11-20: they repeated them).
  const interior = [
    val("cluster") && card("interior-cluster", "Хянах самбар", val("cluster")),
    val("screen") && card("interior-screen", "Төв дэлгэц, аудио", val("screen")),
    val("seat_material") && card("interior-seats", "Суудал", val("seat_material")),
    has("ac") && card("interior-ac", "Агааржуулагч", val("ac_control") || "Стандартаар"),
    val("start") && card("interior-start", "Асаалт", val("start"))
  ].filter((item): item is Card => Boolean(item) && pictured((item as Card).image)).sort(photoFirst).slice(0, 4);
  if (isR5ProCargo) {
    sections.push({ id: "interior", blocks: [{
      type: "feature", image: image("interior-screen", "Ухаалаг кабин"), tagline: "Кабин", title: "Жолоочид тухтай ухаалаг кабин",
      text: "Тод дэлгэц, энгийн удирдлага болон өдөр тутмын ажилд тохирсон тав тухтай жолоодлогын орчин.",
      facts: facts([["Хянах самбар", val("cluster")], ["Төв дэлгэц", val("screen")], ["Агааржуулагч", val("ac_control") || "Стандартаар"]])
    }] });
  } else if (interior.length >= 2) {
    sections.push({ id: "interior", blocks: [
      { type: "title", tagline: "Кабин", title: "Жолоочид зориулсан кабин", text: "Энгийн, ойлгомжтой удирдлага бүхий кабин." },
      { type: "cards", items: interior }
    ] });
  }

  return { sections, notes, peeks: collectPeeks(sections, slug) };
}
