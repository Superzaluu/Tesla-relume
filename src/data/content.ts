// Content loaded from Supabase (server components only).
//
// Supabase holds: menu categories and their models, model names/descriptions,
// the icon facts (QuickSpecs), key stats, hero slides and spec tables.
// The page layout of each model (hero photo, sections, gallery, notes) stays in
// code: src/data/catalog.ts, ec75.ts, r5.ts. A model therefore needs a page
// there before its menu entry, card and hero slide are shown.
import { cache } from "react";
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { select } from "@/lib/supabase";
import type { HeroSlide } from "./home";
import { modelBySlug as pageModelBySlug, modelHref } from "./models";
import type { NavCategory } from "./navigation";
import { buildSpecRows, type SpecRow } from "./specTable";
import { pick, type CategoryId, type Model, type QuickSpecs, type Stat, type V, type Variant } from "./types";

type CategoryRow = { id: string; label: string; sort: number };
type ModelRow = {
  slug: string; name: string; description: string;
  quick_type: QuickSpecs["type"] | null; quick_label: string | null; drive: QuickSpecs["drive"] | null;
  fuel: string | null; size: string | null; range: string | null; doors: string | null; door_label: string | null;
  charge: string | null; seats: string | null; payload: string | null; engine: string | null;
};
type StatRow = { model_slug: string; sort: number; variant: Variant | null; value: string; unit: string; label: string; note: number | null };
type ListingRow = { key: string; category_id: string; model_slug: string; variant: Variant | null; description: string | null; sort: number };
type HeroRow = {
  model_slug: string; theme: "light" | "dark"; theme_sm: "light" | "dark" | null; sky: string;
  eyebrow: string | null; subtitle: string | null; href: string | null;
  image_src: string; image_width: number; image_height: number; image_alt: string | null; image_position: string | null;
  messages: string[] | null;
};

const getCategoryRows = cache(() => select<CategoryRow>("categories", "select=id,label,sort&order=sort,id"));
const getModelRows = cache(async () => new Map((await select<ModelRow>("models", "select=*")).map((row) => [row.slug, row])));
const getStatRows = cache(() =>
  select<StatRow>("model_stats", "select=model_slug,sort,variant,value,unit,label,note&order=model_slug,sort,variant")
);
const getListingRows = cache(() =>
  select<ListingRow>("model_listings", "select=key,category_id,model_slug,variant,description,sort&active=eq.true&order=sort,key")
);

const toQuick = (row: ModelRow): QuickSpecs | undefined =>
  row.quick_type
    ? {
        type: row.quick_type, label: row.quick_label ?? "", drive: row.drive ?? "RWD",
        fuel: row.fuel ?? undefined, size: row.size ?? "", range: row.range ?? "", doors: row.doors ?? "",
        doorLabel: row.door_label ?? undefined, charge: row.charge ?? "", seats: row.seats ?? "",
        payload: row.payload ?? "", engine: row.engine ?? undefined
      }
    : undefined;

/** Rows with the same `sort` form one stat; cargo/passenger rows become a variant value. */
function toStats(rows: StatRow[]): Stat[] {
  const groups = new Map<number, StatRow[]>();
  for (const row of rows) groups.set(row.sort, [...(groups.get(row.sort) ?? []), row]);
  return [...groups.entries()].sort(([a], [b]) => a - b).map(([, group]) => {
    const shared = group.find((row) => row.variant === null);
    if (shared) return { value: shared.value, unit: shared.unit, label: shared.label, note: shared.note ?? undefined };
    const cargo = group.find((row) => row.variant === "cargo") ?? group[0];
    const passenger = group.find((row) => row.variant === "passenger") ?? cargo;
    const both = (field: "value" | "unit" | "label"): V<string> =>
      cargo[field] === passenger[field] ? cargo[field] : { cargo: cargo[field], passenger: passenger[field] };
    return { value: both("value"), unit: both("unit"), label: both("label"), note: cargo.note ?? passenger.note ?? undefined };
  });
}

/** A model's page layout from code, merged with its name, description, icon facts and stats from Supabase. */
export const getModel = cache(async (slug: string): Promise<Model | undefined> => {
  const base = pageModelBySlug(slug);
  if (!base) return undefined;
  const [rows, statRows] = await Promise.all([getModelRows(), getStatRows()]);
  const row = rows.get(slug);
  if (!row) return base;
  const stats = statRows.filter((stat) => stat.model_slug === slug);
  return {
    ...base,
    name: row.name,
    desc: row.description,
    quick: toQuick(row),
    page: { ...base.page, stats: stats.length > 0 ? toStats(stats) : base.page.stats }
  };
});

/** Menu categories with their models (header, footer, homepage cards). */
export const getNavigation = cache(async (): Promise<NavCategory[]> => {
  const [categories, listings, models] = await Promise.all([getCategoryRows(), getListingRows(), getModelRows()]);
  return categories
    .map((category) => ({
      id: category.id as CategoryId,
      label: category.label,
      items: listings
        .filter((listing) => listing.category_id === category.id && models.has(listing.model_slug) && pageModelBySlug(listing.model_slug))
        .map((listing) => {
          const model = models.get(listing.model_slug)!;
          return {
            key: listing.key, slug: listing.model_slug, variant: listing.variant ?? undefined, name: model.name,
            desc: listing.description ?? model.description, href: modelHref(listing.model_slug, listing.variant ?? undefined),
            thumb: `/assets/thumbs/${listing.key}.jpg`
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
  const slides = await Promise.all(
    rows
      .filter((row) => models.has(row.model_slug) && pageModelBySlug(row.model_slug))
      .map(async (row): Promise<HeroSlide> => {
        const model = models.get(row.model_slug)!;
        return {
          id: `hero-${row.model_slug}`,
          theme: row.theme,
          themeSm: row.theme_sm ?? undefined,
          sky: row.sky,
          eyebrow: row.eyebrow ?? (await getCategoryLabel(row.model_slug)) ?? "",
          model: model.name,
          subtitle: row.subtitle ?? model.description,
          href: row.href ?? modelHref(row.model_slug),
          messages: row.messages ?? undefined,
          quick: toQuick(model),
          image: {
            src: row.image_src, width: row.image_width, height: row.image_height,
            alt: row.image_alt ?? `${model.name} — ${model.description}`, position: row.image_position ?? undefined
          }
        };
      })
  );
  return slides;
});

/** The detailed spec table of one model, or null when it has none. */
export const getSpecRows = cache(async (slug: string): Promise<SpecRow[] | null> => {
  const rows = await select<{ cells: string[] }>("spec_rows", `select=cells&model_slug=eq.${encodeURIComponent(slug)}&order=sort`);
  return buildSpecRows(rows.map((row) => row.cells));
});
