import Link from "next/link";
import { ImageField, SubmitButton } from "@/components/admin/AdminInputs";
import { Notice, Panel, Select, StatusBadge } from "@/components/admin/AdminUi";
import type { HeroRow } from "@/data/content";
import { requireAdmin } from "@/lib/supabase-auth";
import { createHero, setHeroActive } from "../../actions";

type ModelName = { slug: string; name: string; description: string };

export default async function HeroPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: slides }, { data: models }] = await Promise.all([
    supabase.from("hero_slides").select("*").order("sort").order("model_slug"),
    supabase.from("models").select("slug,name,description").order("name")
  ]);
  const rows = (slides ?? []) as HeroRow[];
  const modelBySlug = new Map(((models ?? []) as ModelName[]).map((model) => [model.slug, model]));
  const withoutSlide = ((models ?? []) as ModelName[]).filter((model) => !rows.some((row) => row.model_slug === model.slug));

  return (
    <>
      <h1 className="text-[32px] font-bold tracking-tight text-ink">Hero слайд</h1>
      <p className="mb-6 mt-1 text-small text-ink-secondary">Нүүр хуудасны дээд хэсэгт дарааллаар нь гүйнэ. Загвар бүрт нэг слайд.</p>
      <Notice saved={saved} error={error} />

      <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white p-0">
        {rows.map((slide) => {
          const model = modelBySlug.get(slide.model_slug);
          return (
            <li key={slide.model_slug} className={`flex flex-wrap items-center gap-4 px-5 py-3 ${slide.active ? "" : "bg-[#fafbfc]"}`}>
              <span className="w-6 text-center text-small font-semibold text-ink-muted">{slide.sort}</span>
              <img src={slide.image_src} alt="" className={`h-16 w-32 shrink-0 rounded-lg object-cover ${slide.active ? "" : "opacity-50"}`} style={{ background: slide.sky }} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{model?.name ?? slide.model_slug}</p>
                <p className="truncate text-small text-ink-muted">{slide.subtitle || model?.description}</p>
              </div>
              <StatusBadge active={slide.active} />
              <div className="flex gap-2">
                <Link href={`/admin/hero/${encodeURIComponent(slide.model_slug)}/`} className="btn btn--secondary px-4">Засах</Link>
                <form action={setHeroActive}>
                  <input type="hidden" name="model_slug" value={slide.model_slug} />
                  <input type="hidden" name="active" value={slide.active ? "false" : "true"} />
                  <button type="submit" className="rounded-lg border border-line px-3 py-2 text-small text-ink hover:bg-[#f1f3f5]">
                    {slide.active ? "Нуух" : "Сэргээх"}
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 max-w-3xl">
        {withoutSlide.length > 0 ? (
          <form action={createHero}>
            <Panel title="Шинэ слайд нэмэх" description="Слайдгүй загварт слайд нэмнэ. Нэмсний дараа текст, өнгөө засна.">
              <div className="space-y-4">
                <Select name="model_slug" label="Загвар" options={withoutSlide.map((model) => [model.slug, `${model.name} — ${model.description}`])} />
                <Select name="theme" label="Зургийн өнгө" options={[["light", "Цайвар зураг (бараан бичиг)"], ["dark", "Бараан зураг (цагаан бичиг)"]]} />
                <ImageField name="image_file" label="Слайдын зураг *" required hint="Өргөн зураг тохиромжтой (жишээ нь 1920 × 1080). JPG, PNG, WebP, 4 MB хүртэл." />
                <SubmitButton>Слайд нэмэх</SubmitButton>
              </div>
            </Panel>
          </form>
        ) : (
          <p className="text-small text-ink-muted">Бүх загварт слайд байна. Шинэ слайд нэмэхийн тулд эхлээд &quot;Машины карт&quot;-аас шинэ загвар нэмнэ.</p>
        )}
      </div>
    </>
  );
}
