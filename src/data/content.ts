// Content loaded from Supabase (server components only). Edited in /admin.
//
// Supabase holds: menu categories and cards (model_listings), models with their
// icon facts, key stats and spec table, and the homepage hero slides.
// Models with a hand-made page in code (src/data/catalog.ts, ec75.ts, r5.ts) keep
// that page layout; models added in /admin get a standard page built from Supabase.
import { cache } from "react";
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { select } from "@/lib/supabase";
import { DEFAULT_EV_CONSUMPTION, type CalcModel, type FuelCode } from "./savings";
import type { HeroSlide } from "./home";
import { greenLoanHref, modelBySlug as pageModelBySlug, modelHref, preorderHref } from "./models";
import type { NavCategory } from "./navigation";
import { buildSpecRows, type SpecRow } from "./specTable";
import { fromLegacy, viewSheet, type SheetView, type SlotSet, type SpecSheet } from "./specSheet";
import { isByVariant, pick, toFuelType, type CategoryId, type Model, type QuickSpecs, type Stat, type Variant } from "./types";

export type CategoryRow = { id: string; label: string; sort: number };
export type ModelRow = {
  slug: string; name: string; description: string; tagline: string | null;
  quick_type: QuickSpecs["type"] | null; quick_label: string | null; drive: QuickSpecs["drive"] | null;
  fuel: string | null; size: string | null; range: string | null; doors: string | null; door_label: string | null;
  charge: string | null; seats: string | null; seats_passenger: string | null; payload: string | null; engine: string | null;
  stats: Stat[]; image_src: string | null; image_width: number | null; image_height: number | null;
  compare_name: string | null; compare_fuel: FuelCode | null; compare_consumption: number | null; ev_consumption: number | null;
  /** Online pre-order deposit in MNT (Byl); null = none. */
  deposit_amount?: number | null;
  /** Payload per configuration from the spec sheet (models.specs → values.payload, kg); preferred over `payload`. */
  sheet_payload?: string[] | null;
  /** Same for fast charging (min), electric range, total range (km) and motor power (kW): preferred over the card fields. */
  sheet_dc?: string[] | null;
  sheet_range?: string[] | null;
  sheet_total?: string[] | null;
  sheet_power?: string[] | null;
};
export type ListingRow = {
  key: string; category_id: string; model_slug: string; variant: Variant | null;
  description: string | null; sort: number; active: boolean; thumb: string | null;
};
export type HeroRow = {
  model_slug: string; sort: number; active: boolean; theme: "light" | "dark"; theme_sm: "light" | "dark" | null; sky: string;
  eyebrow: string | null; subtitle: string | null; href: string | null;
  image_src: string; image_width: number; image_height: number; image_alt: string | null; image_position: string | null;
  messages: string[] | null;
};

/** Every models column except the (large) spec table. */
export const MODEL_COLUMNS =
  "slug,name,description,tagline,quick_type,quick_label,drive,fuel,size,range,doors,door_label,charge,seats,seats_passenger,payload,engine,stats,image_src,image_width,image_height," +
  "compare_name,compare_fuel,compare_consumption,ev_consumption";

const getCategoryRows = cache(() => select<CategoryRow>("categories", "select=id,label,sort&order=sort,id"));
const getModelRows = cache(async () =>
  new Map((await select<ModelRow>("models", `select=${MODEL_COLUMNS},${SHEET_COLUMNS}`)).map((row) => [row.slug, row]))
);
const SHEET_COLUMNS = [
  "sheet_payload:specs->values->payload", "sheet_dc:specs->values->dc_time", "sheet_range:specs->values->range",
  "sheet_total:specs->values->total_range", "sheet_power:specs->values->power"
].join(",");

/**
 * A number from the spec sheet for the card and hero strip, so they never disagree with the table below
 * (4.2, user 2026-11-20): ["3000", "3000"] + "кг" → "3,000 кг", ["1500–2000"] → "1,500–2,000 кг".
 * Undefined when the sheet has no figure, so the hand-entered card field is used instead.
 */
function sheetSpan(values: string[] | null | undefined, unit: string): string | undefined {
  const nums = (values ?? []).flatMap((value) => (value.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => Number(n.replace(",", "."))));
  if (nums.length === 0) return undefined;
  const fmt = (n: number) => n.toLocaleString("en-US");
  const [min, max] = [Math.min(...nums), Math.max(...nums)];
  return `${min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`} ${unit}`;
}
const sheetPayload = (row: ModelRow) => sheetSpan(row.sheet_payload, "кг");
const getListingRows = cache(() =>
  select<ListingRow>("model_listings", "select=*&active=eq.true&order=sort,key")
);

// Card photos shipped in public/assets/thumbs; any other card without an uploaded photo shows "Coming soon".
const THUMB_FILES = new Set([
  "c3-cold", "c3", "c5-cng", "c5-drone", "c5-reev", "c5", "c5l", "c9", "ec31", "ec31l", "ec31s", "ec35", "ec75-cargo", "ec75-passenger",
  "ec75pro-cargo", "ec75pro-passenger", "ed71s", "r5-cargo", "r5-passenger", "r5-service", "r5pro-cargo", "r5pro-passenger"
]);
export const COMING_SOON = "/assets/coming-soon.svg";
export const listingThumb = (listing: Pick<ListingRow, "key" | "thumb">) =>
  listing.thumb || (THUMB_FILES.has(listing.key) ? `/assets/thumbs/${listing.key}.jpg` : COMING_SOON);

/** A cargo/passenger value as one string: "70" + "70–100" → "70–100", "7.7" + "6–14" → "7.7/6–14". */
const flatten = (value: Stat["value"]): string => {
  if (!isByVariant(value)) return value;
  const { cargo, passenger } = value;
  if (cargo === passenger || cargo.includes(passenger)) return cargo;
  return passenger.includes(cargo) ? passenger : `${cargo}/${passenger}`;
};
/** "130 кВт" from the first key stat whose label matches, e.g. "Моторын оргил чадал". */
const statText = (stats: Stat[], label: RegExp) => {
  const stat = stats.find((item) => label.test(flatten(item.label)));
  return stat ? `${flatten(stat.value)} ${flatten(stat.unit)}`.trim() : undefined;
};

export function toQuick(row: ModelRow): QuickSpecs | undefined {
  if (!row.quick_type) return undefined;
  const fuel = toFuelType(row.fuel, row.engine);
  // The spec sheet wins; the hand-entered fields are only for models without a sheet (EC31, EC75, R5…).
  // Range extender: the sheet's "range" is the electric-only range, "total_range" the range with the extender.
  const sheetRange = sheetSpan(row.sheet_range, "км");
  const sheetTotal = fuel !== "BEV" ? sheetSpan(row.sheet_total, "км") : undefined;
  return {
    type: row.quick_type, label: row.quick_label ?? "", drive: row.drive ?? "RWD",
    fuel, size: row.size ?? "", doors: row.doors ?? "",
    range: (fuel === "BEV" ? sheetRange : sheetTotal) ?? row.range ?? "",
    doorLabel: row.door_label || undefined, charge: row.charge ?? "", seats: row.seats ?? "",
    seatsPassenger: row.seats_passenger || undefined,
    payload: sheetPayload(row) ?? row.payload ?? "", engine: row.engine || undefined,
    // Key stats: the standard label "Моторын оргил чадал" and the older "Моторын оргил хүч" / "Моторын хүч".
    power: sheetSpan(row.sheet_power, "кВт") ?? statText(row.stats, /моторын (оргил )?(хүч|чадал)/i),
    fastCharge: sheetSpan(row.sheet_dc, "мин") ?? statText(row.stats, /хурдан цэнэглэлт/i),
    evRange: (fuel !== "BEV" ? sheetRange : undefined) ?? statText(row.stats, /цахилгаанаар/i)
  };
}

/** Standard page for a model added in /admin (no hand-made page in code). */
function standardPage(row: ModelRow, photo: string | undefined): Model["page"] {
  const width = row.image_width ?? 1200;
  const height = row.image_height ?? 720;
  return {
    tagline: row.tagline ?? undefined,
    hero: {
      kind: "intro",
      image: { src: row.image_src || photo || COMING_SOON, width, height, alt: `${row.name} — ${row.description}` },
      maxWidth: Math.min(1100, Math.round(width * 1.5))
    },
    stats: row.stats,
    statsSecondary: "specs",
    specTable: true,
    end: {
      title: "Туршаад үзэх үү?",
      text: "Ойролцоох салбартаа туршилтын жолоодлого захиалж, ногоон зээл болон урьдчилсан захиалгын нөхцөлөө тодруулаарай.",
      secondary: { label: "Ногоон зээл", href: greenLoanHref(row.slug) }
    },
    notes: [
      "Туулах зай нь стандарт туршилтын үр дүн. Бодит зай нь тохиргоо, ачаа, батерейн насжилт, жолоодлогын зуршил, цаг агаар, замын нөхцөлөөс хамаарна.",
      "Техникийн үзүүлэлтийг үйлдвэрлэгчийн 2026.11.12-ны хүснэгтээс шалгав. Монголд нийлүүлэх тохиргоог салбараас тодруулна уу.",
      "Үзүүлэлт, тохиргоо нь урьдчилан мэдэгдэлгүйгээр өөрчлөгдөж болно. Зурагт харуулсан машин бодит машинаас ялгаатай байж болно."
    ]
  };
}

/** A model's page: its layout from code (or the standard page), with name, description, icon facts and stats from Supabase. */
export const getModel = cache(async (slug: string): Promise<Model | undefined> => {
  const base = pageModelBySlug(slug);
  const row = (await getModelRows()).get(slug);
  if (!row) return base;
  const content = { slug, name: row.name, desc: row.description, quick: toQuick(row) };
  if (base) {
    return { ...base, ...content, page: { ...base.page, stats: row.stats.length > 0 ? row.stats : base.page.stats } };
  }
  // A model added in /admin has a page only while one of its cards is shown.
  const listing = (await getListingRows()).find((item) => item.model_slug === slug);
  if (!listing) return undefined;
  return { ...content, page: standardPage(row, listingThumb(listing)) };
});

/** Slugs of models with a shown card (pages built ahead of time; hand-made pages are added by the route). */
export const getModelSlugs = async () => [...new Set((await getListingRows()).map((listing) => listing.model_slug))];

/** Menu categories with their models (header, footer, homepage cards). */
export const getNavigation = cache(async (): Promise<NavCategory[]> => {
  const [categories, listings, models] = await Promise.all([getCategoryRows(), getListingRows(), getModelRows()]);
  return categories
    .map((category) => ({
      id: category.id as CategoryId,
      label: category.label,
      items: listings
        .filter((listing) => listing.category_id === category.id && models.has(listing.model_slug))
        .map((listing) => {
          const model = models.get(listing.model_slug)!;
          return {
            key: listing.key, slug: listing.model_slug, variant: listing.variant ?? undefined, name: model.name,
            desc: listing.description || model.description, href: modelHref(listing.model_slug, listing.variant ?? undefined),
            thumb: listingThumb(listing)
          };
        })
    }))
    .filter((category) => category.items.length > 0);
});

/** The first menu category that lists the model (id + label). */
export const getCategory = async (slug: string) =>
  (await getNavigation()).find((category) => category.items.some((item) => item.slug === slug));
export const getCategoryLabel = async (slug: string) => (await getCategory(slug))?.label;

/** Homepage "Бүх загвар" cards: every menu entry with its first three stats. */
export const getModelCards = cache(async (): Promise<{ cards: ModelCardData[]; categories: { id: string; label: string }[] }> => {
  const navigation = await getNavigation();
  const cards = await Promise.all(
    navigation.flatMap((category) =>
      category.items.map(async (item): Promise<ModelCardData> => {
        const model = (await getModel(item.slug))!;
        const variant: Variant = item.variant ?? "cargo";
        const stats = model.page.stats.slice(0, 3).map((stat) => ({
          value: pick(stat.value, variant), unit: pick(stat.unit, variant), label: pick(stat.label, variant)
        }));
        return {
          key: item.key, slug: item.slug, href: item.href, preorderHref: preorderHref(item.slug, item.variant), thumb: item.thumb, name: item.name, desc: item.desc,
          categoryId: category.id, category: category.label, stats,
          // A card shows one version, so it gets that version's seats.
          quick: model.quick && {
            ...model.quick,
            seats: variant === "passenger" && model.quick.seatsPassenger ? model.quick.seatsPassenger : model.quick.seats,
            seatsPassenger: undefined
          }
        };
      })
    )
  );
  return { cards, categories: navigation.map(({ id, label }) => ({ id, label })) };
});

/** One calculator entry from a model row. */
function toCalcModel(row: ModelRow, value: string, name: string, category: string): CalcModel {
  const evRange = statText(row.stats, /цахилгаанаар/i);
  return {
    value, slug: row.slug, name, category,
    fuel: toFuelType(row.fuel, row.engine),
    evConsumption: Number(row.ev_consumption) || DEFAULT_EV_CONSUMPTION,
    evRangeKm: evRange ? Number.parseFloat(evRange) || undefined : undefined,
    rangeKm: Number.parseFloat((row.range ?? "").replace(/,/g, "")) || undefined,
    compare: {
      name: row.compare_name || "Ижил ангиллын дизель машин",
      fuel: row.compare_fuel ?? "dt",
      consumption: Number(row.compare_consumption) || 11
    }
  };
}

/** Every menu card for the savings calculator, with the combustion vehicle it is compared to. */
export const getCalculatorModels = cache(async (): Promise<CalcModel[]> => {
  const [navigation, rows] = await Promise.all([getNavigation(), getModelRows()]);
  return navigation.flatMap((category) =>
    category.items.flatMap((item) => {
      const row = rows.get(item.slug);
      return row ? [toCalcModel(row, `${item.slug}|${item.variant ?? ""}`, item.name, category.label)] : [];
    })
  );
});

/**
 * The calculator entry for one model page (its quick fuel-cost window counts for this model only): its menu
 * entry, or, for a model not in the menu (C9), one built from its own row.
 */
export const getCalculatorModel = cache(async (slug: string): Promise<CalcModel | undefined> => {
  const listed = (await getCalculatorModels()).find((model) => model.slug === slug);
  if (listed) return listed;
  const row = (await getModelRows()).get(slug);
  return row ? toCalcModel(row, `${slug}|`, row.name, "Бусад") : undefined;
});

/** Homepage hero slides in `sort` order. Empty text fields fall back to the category, description and model page. */
export const getHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  const [rows, models] = await Promise.all([
    select<HeroRow>("hero_slides", "select=*&active=eq.true&order=sort,model_slug"),
    getModelRows()
  ]);
  return Promise.all(
    rows
      .filter((row) => models.has(row.model_slug))
      .map(async (row): Promise<HeroSlide> => {
        const model = models.get(row.model_slug)!;
        return {
          id: `hero-${row.model_slug}`,
          theme: row.theme,
          themeSm: row.theme_sm ?? undefined,
          sky: row.sky,
          eyebrow: row.eyebrow || (await getCategoryLabel(row.model_slug)) || "",
          model: model.name,
          subtitle: row.subtitle || model.description,
          href: row.href || modelHref(row.model_slug),
          messages: row.messages?.length ? row.messages : undefined,
          quick: toQuick(model),
          image: {
            src: row.image_src, width: row.image_width, height: row.image_height,
            alt: row.image_alt || `${model.name} — ${model.description}`, position: row.image_position || undefined
          }
        };
      })
  );
});

/** The detailed spec table of one model, or null when it has none. */
export const getSpecRows = cache(async (slug: string): Promise<SpecRow[] | null> => {
  const [row] = await select<{ spec: string[][] | null }>("models", `select=spec&slug=eq.${encodeURIComponent(slug)}`);
  return row?.spec ? buildSpecRows(row.spec) : null;
});

/** The structured spec sheet: saved from the admin form, or converted from the old table until then. */
export async function getSpecSheet(slug: string): Promise<SpecSheet | null> {
  const [row] = await select<{ spec: string[][] | null; specs: SpecSheet | null }>("models", `select=spec,specs&slug=eq.${encodeURIComponent(slug)}`);
  if (row?.specs?.configs?.length) return row.specs;
  return row?.spec?.length ? fromLegacy(row.spec) : null;
}

/** What the model page shows from the spec sheet (only configurations marked for sale). */
export async function getSpecView(slug: string, fuel?: string, slotSet?: SlotSet): Promise<SheetView | null> {
  const sheet = await getSpecSheet(slug);
  return sheet ? viewSheet(sheet, fuel, slotSet) : null;
}
