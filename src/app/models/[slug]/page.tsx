import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelPage } from "@/components/model/ModelPage";
import { getCalculatorModel, getCategory, getModel, getModelCards, getModelSlugs, getSpecSheet } from "@/data/content";
import { models } from "@/data/models";
import { slotSetFor, viewSheet } from "@/data/specSheet";
import { buildStory } from "@/data/story";

type Props = { params: Promise<{ slug: string }> };

// Every model in Supabase gets a page; models added later in /admin are built on first visit.
// Content refreshes at most once a minute (immediately after saving in /admin).
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = new Set([...models.map((model) => model.slug), ...(await getModelSlugs())]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = await getModel((await params).slug);
  if (!model) return {};
  return { title: `${model.name} — ${model.page.pageTitle ?? model.desc}`, description: model.page.tagline ?? model.desc };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const found = await getModel(slug);
  if (!found) notFound();
  const category = await getCategory(slug);
  // The category picks the three category-specific key slots (CATEGORY_SLOTS in specSheet.ts).
  const slotSet = slotSetFor(category?.id, found.quick?.type);
  const sheet = await getSpecSheet(slug);

  // One standard for every page (user, 2026-11-20): picture sections + the B′ spec section.
  // EC75 / R5 keep their hand-written sections; once their sheet is in Supabase, the sheet's spec
  // section replaces their own "specs" block. Every other model gets sections built from its sheet.
  let page = found.page;
  if (sheet && page.sections) {
    page = { ...page, specTable: true, sections: page.sections.filter((section) => section.id !== "specs") };
  } else if (sheet && page.specTable !== false) {
    const story = buildStory(sheet, found.name, slug, found.quick?.fuel, slotSet, page.notes.length);
    page = { ...page, specTable: true, sections: story.sections, notes: [...page.notes, ...story.notes], peeks: story.peeks };
  }
  const model = { ...found, page };
  const specView = page.specTable && sheet ? viewSheet(sheet, model.quick?.fuel, slotSet) : null;

  // "Төстэй загварууд": up to four other cards from the same menu category.
  const [{ cards }, calc] = await Promise.all([getModelCards(), getCalculatorModel(slug)]);
  const similar = category ? cards.filter((card) => card.categoryId === category.id && card.slug !== slug).slice(0, 4) : [];
  return <ModelPage model={model} category={category?.label} specView={specView} similar={similar} calc={calc} />;
}
