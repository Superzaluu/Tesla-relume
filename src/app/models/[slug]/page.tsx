import { notFound } from "next/navigation";
import { ModelPage } from "@/components/ModelPage";
import { modelBySlug, models } from "@/data/models";

export const dynamicParams = false;
export function generateStaticParams() { return models.map(({ slug }) => ({ slug })); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const model = modelBySlug((await params).slug); if (!model) notFound(); return <ModelPage model={model} />; }
