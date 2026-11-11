import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelPage } from "@/components/ModelPage";
import { modelBySlug, models } from "@/data/models";
import { categoryOf } from "@/data/navigation";
import { readSpecTable } from "@/data/specTable";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return models.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = modelBySlug((await params).slug);
  if (!model) return {};
  return { title: `${model.name} — ${model.page.pageTitle ?? model.desc}`, description: model.page.tagline ?? model.desc };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const model = modelBySlug(slug);
  if (!model) notFound();
  return <ModelPage model={model} category={categoryOf(slug)?.label} specRows={model.page.specTable ? readSpecTable(slug) : null} />;
}
