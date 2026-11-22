import type { Block, Section } from "@/data/types";
import type { SheetView } from "@/data/specSheet";
import { PartView } from "@/components/model/Blocks";
import { SmartGrid, type SmartGroup } from "@/components/model/SmartGrid";
import { WinterSection } from "@/components/model/WinterSection";

// Variant A of the Gestalt pass (user, 2026-11-20): the model page's picture sections are grouped into three
// chapters, each one tinted region (Common Region) holding the sections that belong together (Proximity):
// cargo with the build, battery with charging and winter, and assistance with safety and the cabin. The menu
// names the chapters (Uniform Connectedness). Sections are matched by id, so EC75 / R5's hand-written sections
// and the generated ones group the same way; a section in no chapter keeps its own band after them.

type ChapterDef = { id: string; label: string; kicker: string; tone: "sand" | "blue" | "green"; parts: string[] };

export const CHAPTERS: ChapterDef[] = [
  // id "load", not "cargo": #cargo / #passenger pick the EC75 / R5 side, and an element with id "cargo" made the
  // browser jump past the hero on /models/ec75/#cargo (and on the R5 Pro / EC75 Pro redirects; 2026-11-21).
  { id: "load", label: "Ачаа", kicker: "Ачаа ба бүтэц", tone: "sand", parts: ["cargo-space", "space", "work", "service"] },
  { id: "power", label: "Хүч ба цэнэглэлт", kicker: "Хүч ба цэнэглэлт", tone: "blue", parts: ["battery", "charging", "winter"] },
  { id: "smart", label: "Аюулгүй ба ухаалаг", kicker: "Аюулгүй ба ухаалаг", tone: "green", parts: ["assist", "safety", "interior"] }
];

export type Chapter = ChapterDef & { sections: Section[]; winter?: SheetView["winter"] };

/** The chapters this model has (in the fixed order), and the sections that belong to none. */
export function groupChapters(sections: Section[], winter?: SheetView["winter"]): { chapters: Chapter[]; rest: Section[] } {
  const inChapter = new Set(CHAPTERS.flatMap((chapter) => chapter.parts));
  const chapters = CHAPTERS.map((chapter) => ({
    ...chapter,
    sections: chapter.parts.flatMap((id) => sections.filter((section) => section.id === id)),
    // The sheet's winter block joins «Хүч ба цэнэглэлт» unless the model has its own winter section (EC75).
    winter: chapter.id === "power" && winter && !sections.some((section) => section.id === "winter") ? winter : undefined
  })).filter((chapter) => chapter.sections.length > 0 || chapter.winter);
  return { chapters, rest: sections.filter((section) => !inChapter.has(section.id ?? "")) };
}

const SMART_GROUP: Record<string, string> = { adas: "Туслах систем", safety: "Аюулгүй байдал", cards: "Кабин" };

/**
 * Equipment keys a picture card explains (user test #1, 2026-11-23, item 5): an equipment chip with the same
 * key gets «Зурагтай тайлбар харах», which jumps to the card. From the card's id (ADAS: the field key) and its
 * code / tag ("AEB · FCW", "TJA/ICA", "360°"), plus the cabin's air-conditioning card by title.
 */
const TAG_FEATURE: Record<string, string> = { "360°": "camera360", "auto hold": "autohold", "tja": "ica" };
const featuresOf = (id: string | undefined, code: string | undefined, title = "") => [...new Set([
  id ?? "",
  ...(code ?? "").toLowerCase().split(/\s*[·/]\s*/).map((part) => TAG_FEATURE[part.trim()] ?? part.trim()),
  /агааржуулагч/i.test(title) ? "ac" : ""
])].filter((key) => /^[a-z0-9_]+$/.test(key)).join(" ");

/**
 * «Аюулгүй ба ухаалаг»: the picture cards of its sections become one filterable grid (SmartGrid); the ADAS
 * title (with its footnote) heads the chapter; anything else (R5's cabin feature) follows the grid.
 */
function SmartChapter({ sections }: { sections: Section[] }) {
  const groups: SmartGroup[] = [];
  const add = (label: string, items: SmartGroup["items"]) => {
    const group = groups.find((item) => item.label === label);
    if (group) group.items.push(...items); else groups.push({ label, items });
  };
  const other: Block[] = [];
  let heading: Extract<Block, { type: "title" }> | undefined;
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type === "title") { if (section.id === "assist") heading = block; continue; }
      if (block.type === "adas") add(SMART_GROUP.adas, block.items.map((item) => ({ key: `adas-${item.id}`, title: item.name, tag: item.code, text: item.text, image: item.image, features: featuresOf(item.id, item.code) })));
      else if (block.type === "safety") add(SMART_GROUP.safety, block.items.map((card) => ({ key: `safety-${card.title}`, id: card.id, title: card.title, tag: card.tag, text: card.text, image: card.image, features: featuresOf(undefined, card.tag, card.title) })));
      else if (block.type === "cards") add(SMART_GROUP.cards, block.items.map((card) => ({ key: `cabin-${card.title}`, id: card.id, title: card.title, tag: card.tag, text: card.text, image: card.image, features: featuresOf(undefined, card.tag, card.title) })));
      else other.push(block);
    }
  }
  return (
    <>
      <div className="mchapter__part" id="assist">
        <div className="section-title section-title--narrow">
          <h2 className="h2">Зам дээр аюулгүй, жолоочид тухтай</h2>
          {heading?.text && <p className="text-medium">{heading.text}{heading.note ? <> <sup>{heading.note}</sup></> : null}</p>}
        </div>
        <SmartGrid groups={groups} />
      </div>
      {other.length > 0 && <PartView section={{ id: "interior", blocks: other }} />}
    </>
  );
}

export function ChapterView({ chapter }: { chapter: Chapter }) {
  return (
    <section className={`section mchapter mchapter--${chapter.tone}`} id={chapter.id} aria-labelledby={`${chapter.id}-kicker`}>
      <div className="container">
        <div className="mchapter__box">
          <p className="mchapter__kicker" id={`${chapter.id}-kicker`}>{chapter.kicker}</p>
          {chapter.id === "smart"
            ? <SmartChapter sections={chapter.sections} />
            : chapter.sections.map((section, i) => <PartView section={section} key={section.id ?? i} />)}
          {chapter.winter && <WinterSection winter={chapter.winter} nested />}
        </div>
      </div>
    </section>
  );
}
