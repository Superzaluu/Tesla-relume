import type { Metadata } from "next";
import { PreorderForm } from "@/components/forms/PreorderForm";
import { getNavigation } from "@/data/content";
import { preorderModelValue, type PreorderModel } from "@/data/preorder";

export const metadata: Metadata = {
  title: "Урьдчилсан захиалга — Ruichi",
  description: "Сонирхсон цахилгаан автомашиндаа урьдчилсан захиалга өгөөрэй. Манай зөвлөх тантай холбогдож нөхцөлийг тохирно."
};

export default async function PreorderPage({ searchParams }: { searchParams: Promise<{ model?: string; variant?: string }> }) {
  const { model, variant } = await searchParams;
  const models: PreorderModel[] = (await getNavigation()).flatMap((category) =>
    category.items.map((item) => ({
      value: preorderModelValue(item.slug, item.variant), name: item.name, desc: item.desc, category: category.label, thumb: item.thumb
    }))
  );
  // Card links carry the variant; links from a model page may not, so fall back to that model's first card.
  const initial =
    models.find((item) => item.value === preorderModelValue(model ?? "", variant))?.value ??
    models.find((item) => item.value.startsWith(`${model ?? ""}|`))?.value ??
    "";

  return (
    <main className="tw bg-[#f5f7f8] pb-section-md pt-[calc(var(--navbar-height)+48px)]">
      <div className="mx-auto max-w-[1120px] px-global">
        <p className="tagline">Урьдчилсан захиалга</p>
        <h1 className="mt-2 text-[clamp(32px,4vw,48px)] font-bold leading-tight tracking-tight text-ink">Машинаа урьдчилан захиалаарай</h1>
        <p className="mb-8 mt-3 max-w-[620px] text-medium text-ink-secondary">
          Загвар, холбоо барих мэдээллээ үлдээгээрэй. Манай зөвлөх тантай холбогдож үнэ, нийлүүлэлтийн хугацаа, төлбөрийн нөхцөлийг тохирно.
        </p>
        <PreorderForm models={models} initial={initial} />
      </div>
    </main>
  );
}
