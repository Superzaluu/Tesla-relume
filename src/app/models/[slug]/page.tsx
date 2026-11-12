import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelPage } from "@/components/model/ModelPage";
import { getCategoryLabel, getModel, getSpecRows } from "@/data/content";
import { models } from "@/data/models";

type Props = { params: Promise<{ slug: string }> };

// Pages exist for the models laid out in code; their content refreshes from Supabase at most once a minute.
export const dynamicParams = false;
export const revalidate = 60;

export function generateStaticParams() {
  return models.map((model) => ({ slug: model.slug }));
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
  const [category, specRows] = await Promise.all([
    getCategoryLabel(slug),
    model.page.specTable !== undefined ? getSpecRows(slug) : null
  ]);
  return <ModelPage model={model} category={category} specRows={specRows} />;
}
