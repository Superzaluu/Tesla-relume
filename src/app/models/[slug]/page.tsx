import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelPage } from "@/components/model/ModelPage";
import { getCategory, getModel, getModelSlugs, getSpecView } from "@/data/content";
import { models } from "@/data/models";
import { slotSetFor } from "@/data/specSheet";

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
  const model = await getModel(slug);
  if (!model) notFound();
  const category = await getCategory(slug);
  // The category picks the three category-specific key slots (CATEGORY_SLOTS in specSheet.ts).
  const slotSet = slotSetFor(category?.id, model.quick?.type);
  const specView = model.page.specTable !== undefined ? await getSpecView(slug, model.quick?.fuel, slotSet) : null;
  return <ModelPage model={model} category={category?.label} specView={specView} />;
}
