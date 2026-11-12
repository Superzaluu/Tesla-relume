// Content loaded from Supabase (server components only). Edited in /admin.
//
// Supabase holds: menu categories and cards (model_listings), models with their
// icon facts, key stats and spec table, and the homepage hero slides.
// Models with a hand-made page in code (src/data/catalog.ts, ec75.ts, r5.ts) keep
// that page layout; models added in /admin get a standard page built from Supabase.
import { cache } from "react";
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { select } from "@/lib/supabase";
import type { HeroSlide } from "./home";
import { modelBySlug as pageModelBySlug, modelHref } from "./models";
import type { NavCategory } from "./navigation";
import { buildSpecRows, type SpecRow } from "./specTable";
import { pick, type CategoryId, type Model, type QuickSpecs, type Stat, type Variant } from "./types";

export type CategoryRow = { id: string; label: string; sort: number };
export type ModelRow = {
  slug: string; name: string; description: string; tagline: string | null;
  quick_type: QuickSpecs["type"] | null; quick_label: string | null; drive: QuickSpecs["drive"] | null;
  fuel: string | null; size: string | null; range: string | null; doors: string | null; door_label: string | null;
  charge: string | null; seats: string | null; payload: string | null; engine: string | null;
  stats: Stat[]; image_src: string | null; image_width: number | null; image_height: number | null;
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
  "slug,name,description,tagline,quick_type,quick_label,drive,fuel,size,range,doors,door_label,charge,seats,payload,engine,stats,image_src,image_width,image_height";

const getCategoryRows = cache(() => select<CategoryRow>("categories", "select=id,label,sort&order=sort,id"));
const getModelRows = cache(async () =>
  new Map((await select<ModelRow>("models", `select=${MODEL_COLUMNS}`)).map((row) => [row.slug, row]))
);
const getListingRows = cache(() =>
  select<ListingRow>("model_listings", "select=*&active=eq.true&order=sort,key")
);

export const listingThumb = (listing: Pick<ListingRow, "key" | "thumb">) => listing.thumb || `/assets/thumbs/${listing.key}.jpg`;

export const toQuick = (row: ModelRow): QuickSpecs | undefined =>
  row.quick_type
    ? {
        type: row.quick_type, label: row.quick_label ?? "", drive: row.drive ?? "RWD",
        fuel: row.fuel || undefined, size: row.size ?? "", range: row.range ?? "", doors: row.doors ?? "",
        doorLabel: row.door_label || undefined, charge: row.charge ?? "", seats: row.seats ?? "",
        payload: row.payload ?? "", engine: row.engine || undefined
      }
    : undefined;

/** Standard page for a model added in /admin (no hand-made page in code). */
function standardPage(row: ModelRow, photo: string | undefined): Model["page"] {
  const width = row.image_width ?? 1200;
  const height = row.image_height ?? 720;
  return {
    tagline: row.tagline ?? undefined,
    hero: {
      kind: "intro",
      image: { src: row.image_src || photo || "/assets/brand-logo-transparent.png", width, height, alt: `${row.name} — ${row.description}` },
      maxWidth: Math.min(1100, Math.round(width * 1.5))
    },
    stats: row.stats,
    statsSecondary: "specs",
    specTable: true,
    end: {
      title: "Туршаад үзэх үү?",
      text: "Ойролцоох салбартаа туршилтын жолоодлого захиалж, ногоон зээл болон урьдчилсан захиалгын нөхцөлөө тодруулаарай.",
      secondary: { label: "Ногоон зээл", href: "#" }
    },
    notes: [
      "Явах зай нь стандарт туршилтын үр дүн. Бодит зай нь тохиргоо, ачаа, зайны насжилт, жолоодлогын зуршил, цаг агаар, замын нөхцөлөөс хамаарна.",
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

export const getCategoryLabel = async (slug: string) =>
  (await getNavigation()).find((category) => category.items.some((item) => item.slug === slug))?.label;

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
          key: item.key, href: item.href, thumb: item.thumb, name: item.name, desc: item.desc,
          categoryId: category.id, category: category.label, stats, quick: model.quick
        };
      })
    )
  );
  return { cards, categories: navigation.map(({ id, label }) => ({ id, label })) };
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
