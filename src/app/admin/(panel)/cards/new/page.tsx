import Link from "next/link";
import { ImageField, ModelChoice, SubmitButton } from "@/components/admin/AdminInputs";
import { Notice, Panel, Select, TextInput } from "@/components/admin/AdminUi";
import type { CategoryRow } from "@/data/content";
import { requireAdmin } from "@/lib/supabase-auth";
import { createCard } from "../../../actions";

export default async function NewCardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: models }] = await Promise.all([
    supabase.from("categories").select("id,label,sort").order("sort"),
    supabase.from("models").select("slug,name,description").order("name")
  ]);

  return (
    <>
      <Link href="/admin/cards/" className="text-small text-ink-muted hover:text-ink">← Машины карт</Link>
      <h1 className="mb-6 mt-2 text-[32px] font-bold tracking-tight text-ink">Шинэ карт нэмэх</h1>
      <Notice error={error} />
      <form action={createCard} className="max-w-3xl space-y-6">
        <Panel title="Карт" description="Нэмсний дараа засах хуудас нээгдэнэ. Тэнд үзүүлэлт, icon-той мэдээлэл, техникийн хүснэгтээ бөглөнө.">
          <div className="space-y-4">
            <Select name="category_id" label="Ангилал *" options={((categories ?? []) as CategoryRow[]).map((c) => [c.id, c.label])} />
            <ModelChoice models={(models ?? []) as { slug: string; name: string; description: string }[]} />
            <Select
              name="variant" label="Хувилбар"
              options={[["", "Нэг хувилбартай"], ["cargo", "Ачааны хувилбар"], ["passenger", "Зорчигчийн хувилбар"]]}
              hint="Зөвхөн EC75, R5 шиг ачааны/зорчигчийн хувилбартай загварт сонгоно."
            />
            <TextInput name="listing_description" label="Карт дээрх тайлбар" hint="Хоосон бол загварын тайлбар харагдана." />
            <ImageField name="thumb_file" label="Картын зураг" hint="5:3 харьцаатай зураг тохиромжтой (жишээ нь 1000 × 600). JPG, PNG, WebP, 4 MB хүртэл." />
          </div>
        </Panel>
        <SubmitButton>Карт нэмэх</SubmitButton>
      </form>
    </>
  );
}
