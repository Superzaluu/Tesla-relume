import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageField, SubmitButton } from "@/components/admin/AdminInputs";
import { Checkbox, Field, inputClass, Notice, Panel, Select, TextInput } from "@/components/admin/AdminUi";
import type { HeroRow } from "@/data/content";
import { modelHref } from "@/data/models";
import { requireAdmin } from "@/lib/supabase-auth";
import { saveHero } from "../../../actions";

export default async function EditHeroPage({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const slug = decodeURIComponent((await params).slug);
  const { saved, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: slide }, { data: model }] = await Promise.all([
    supabase.from("hero_slides").select("*").eq("model_slug", slug).maybeSingle<HeroRow>(),
    supabase.from("models").select("name,description").eq("slug", slug).maybeSingle<{ name: string; description: string }>()
  ]);
  if (!slide || !model) notFound();

  return (
    <>
      <Link href="/admin/hero/" className="text-small text-ink-muted hover:text-ink">← Hero слайд</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-tight text-ink">{model.name} — слайд</h1>
        <a href={`/#hero-${slug}`} target="_blank" className="text-small font-semibold text-[#0f5a3a] hover:underline">Сайт дээр харах ↗</a>
      </div>
      <Notice saved={saved} error={error} />

      <form action={saveHero} className="space-y-6">
        <input type="hidden" name="model_slug" value={slug} />

        <Panel title="Текст" description="Хоосон талбарт загварын мэдээлэл автоматаар харагдана. Слайдын гарчиг нь загварын нэр.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput name="eyebrow" label="Дээд жижиг бичиг" value={slide.eyebrow} placeholder="Хоосон бол ангиллын нэр" />
            <TextInput name="subtitle" label="Дэд гарчиг" value={slide.subtitle} placeholder={model.description} />
            <TextInput name="href" label="&quot;Дэлгэрэнгүй&quot; товчны холбоос" value={slide.href} placeholder={modelHref(slug)} />
            <TextInput name="image_alt" label="Зургийн тайлбар (alt)" value={slide.image_alt} placeholder={`${model.name} — ${model.description}`} />
            <Field label="Гүйдэг мессеж" hint="Мөр бүр нэг мессеж. Хоосон бол харагдахгүй." className="sm:col-span-2">
              <textarea name="messages" defaultValue={(slide.messages ?? []).join("\n")} rows={4} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Зураг ба өнгө">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><ImageField name="image_file" label="Слайдын зураг" current={slide.image_src} /></div>
            <Select name="theme" label="Зургийн өнгө (компьютер)" value={slide.theme} options={[["light", "Цайвар зураг (бараан бичиг)"], ["dark", "Бараан зураг (цагаан бичиг)"]]} />
            <Select name="theme_sm" label="Зургийн өнгө (утас)" value={slide.theme_sm ?? ""} options={[["", "Компьютертэй ижил"], ["light", "Цайвар (бараан бичиг)"], ["dark", "Бараан (цагаан бичиг)"]]} />
            <Field label="Дэвсгэр өнгө" hint="Зургийн дээд хэсгийн өнгөтэй ижил байвал зураг дэвсгэртэй нийлж харагдана.">
              <input type="color" name="sky" defaultValue={slide.sky} className="h-10 w-24 cursor-pointer rounded-lg border border-line bg-white p-1" />
            </Field>
            <TextInput name="image_position" label="Зургийн байрлал" value={slide.image_position} placeholder="50% 50%" hint="Утсан дээр зургийн аль хэсэг харагдах. Жишээ: 50% 0% = дээд хэсэг." />
          </div>
        </Panel>

        <Panel title="Харагдах байдал">
          <div className="grid items-end gap-4 sm:grid-cols-2">
            <TextInput name="sort" label="Дараалал" value={slide.sort} hint="Бага тоо түрүүлж гарна (0 = эхний слайд)." />
            <Checkbox name="active" label="Сайт дээр харуулах" checked={slide.active} />
          </div>
        </Panel>

        <div className="sticky bottom-4 z-10 flex items-center gap-4 rounded-2xl border border-line bg-white/95 p-4 shadow-[0_10px_30px_rgb(15_35_56/.12)] backdrop-blur">
          <SubmitButton>Хадгалах</SubmitButton>
          <span className="text-xs text-ink-muted">Хадгалмагц сайтад шууд гарна.</span>
        </div>
      </form>
    </>
  );
}
