import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageField, StatsEditor, SubmitButton, type StatDraft } from "@/components/admin/AdminInputs";
import { Checkbox, Field, inputClass, Notice, Panel, Select, TextInput } from "@/components/admin/AdminUi";
import { listingThumb, type CategoryRow, type ListingRow, type ModelRow } from "@/data/content";
import { modelBySlug as pageModelBySlug, modelHref } from "@/data/models";
import { collectSuggestions, fromLegacy, type SpecSheet } from "@/data/specSheet";
import { isByVariant, toFuelType, type Stat, type V } from "@/data/types";
import { SpecSheetEditor } from "@/components/admin/SpecSheetEditor";
import { requireAdmin } from "@/lib/supabase-auth";
import { saveCard } from "../../../actions";

const cargo = (value: V<string>) => (isByVariant(value) ? value.cargo : value);
const passenger = (value: V<string>) => (isByVariant(value) ? value.passenger : "");

const toDraft = (stat: Stat): StatDraft => ({
  value: cargo(stat.value), unit: cargo(stat.unit), label: cargo(stat.label), note: stat.note ? String(stat.note) : "",
  pValue: passenger(stat.value), pUnit: passenger(stat.unit), pLabel: passenger(stat.label)
});

export default async function EditCardPage({ params, searchParams }: {
  params: Promise<{ key: string }>; searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const key = decodeURIComponent((await params).key);
  const { saved, error } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: listing } = await supabase.from("model_listings").select("*").eq("key", key).maybeSingle<ListingRow>();
  if (!listing) notFound();
  type SheetRow = { slug: string; spec: string[][] | null; specs: SpecSheet | null };
  const [{ data: model }, { data: categories }, { data: siblings }, { data: allSheets }] = await Promise.all([
    supabase.from("models").select("*").eq("slug", listing.model_slug).single<ModelRow & SheetRow>(),
    supabase.from("categories").select("id,label,sort").order("sort"),
    supabase.from("model_listings").select("key").eq("model_slug", listing.model_slug),
    supabase.from("models").select("slug,spec,specs").returns<SheetRow[]>()
  ]);
  if (!model) notFound();

  const codePage = pageModelBySlug(model.slug);
  const variants = Boolean(codePage?.page.variants) || model.stats.some((stat) => [stat.value, stat.unit, stat.label].some(isByVariant));
  const shared = (siblings ?? []).length;
  const toSheet = (row: SheetRow): SpecSheet | null =>
    row.specs?.configs?.length ? row.specs : row.spec?.length ? fromLegacy(row.spec) : null;
  const sheet = toSheet(model) ?? { configs: [{ name: "Стандарт", sold: true }], values: {}, extras: [] };
  const suggestions = collectSuggestions((allSheets ?? []).map(toSheet).filter((item): item is SpecSheet => item !== null));
  const showsSpec = codePage ? codePage.page.specTable !== undefined : true;

  return (
    <>
      <Link href="/admin/cards/" className="text-small text-ink-muted hover:text-ink">← Машины карт</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[32px] font-bold tracking-tight text-ink">{model.name}</h1>
        <a href={modelHref(model.slug, listing.variant ?? undefined)} target="_blank" className="text-small font-semibold text-[#0f5a3a] hover:underline">Сайт дээр харах ↗</a>
      </div>
      <Notice saved={saved} error={error} />

      <form action={saveCard} className="space-y-6">
        <input type="hidden" name="key" value={listing.key} />
        <input type="hidden" name="model_slug" value={model.slug} />

        <Panel title="Карт" description="Энэ картын байрлал, зураг, тайлбар.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select name="category_id" label="Ангилал" value={listing.category_id} options={((categories ?? []) as CategoryRow[]).map((c) => [c.id, c.label])} />
            <TextInput name="sort" label="Дараалал" value={listing.sort} hint="Бага тоо түрүүлж харагдана (0, 1, 2 …)." />
            <TextInput name="listing_description" label="Карт дээрх тайлбар" value={listing.description} placeholder={model.description} hint="Хоосон бол загварын тайлбар харагдана." />
            <Select
              name="variant" label="Хувилбар" value={listing.variant ?? ""}
              options={[["", "Нэг хувилбартай"], ["cargo", "Ачааны хувилбар"], ["passenger", "Зорчигчийн хувилбар"]]}
            />
            <div className="sm:col-span-2"><ImageField name="thumb_file" label="Картын зураг" current={listingThumb(listing)} /></div>
            <Checkbox name="active" label="Сайт дээр харуулах" checked={listing.active} />
          </div>
        </Panel>

        <Panel
          title="Загвар"
          description={shared > 1 ? `Энэ мэдээлэл ${model.name}-ийн ${shared} картад, мөн загварын хуудсанд хамт өөрчлөгдөнө.` : "Карт, hero слайд болон загварын хуудсанд харагдана."}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput name="name" label="Нэр *" value={model.name} required />
            <TextInput name="description" label="Тайлбар *" value={model.description} required />
            {!codePage && (
              <>
                <Field label="Хуудасны танилцуулга" className="sm:col-span-2">
                  <textarea name="tagline" defaultValue={model.tagline ?? ""} rows={2} className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <ImageField name="image_file" label="Загварын хуудасны том зураг" current={model.image_src} hint="Хоосон бол картын зураг ашиглагдана." />
                </div>
              </>
            )}
          </div>
        </Panel>

        <Panel title="Icon-той мэдээлэл" description="Карт болон hero зураг дээрх icon-той мөр.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select name="quick_type" label="Машины төрөл (icon)" value={model.quick_type ?? ""} options={[
              ["", "— Харуулахгүй —"], ["van", "Фургон"], ["flatbed", "Задгай тэвш"], ["flatbed4", "Задгай тэвш, давхар кабин"],
              ["box", "Битүү тэвш"], ["refrigerator", "Хөргүүртэй"]
            ]} />
            <TextInput name="quick_label" label="Загвар (бичиг)" value={model.quick_label} placeholder="Ачааны фургон" />
            <Select name="drive" label="Хөтлөгч" value={model.drive ?? "RWD"} options={[["FWD", "FWD — урд дугуй"], ["RWD", "RWD — хойд дугуй"], ["AWD", "AWD — бүх дугуй"]]} />
            <TextInput name="size" label="Хэмжээ" value={model.size} placeholder="5130 x 1860 x 2020 мм" />
            <TextInput name="range" label="Туулах зай" value={model.range} placeholder="420 км" />
            <TextInput name="charge" label="Цэнэглэх хугацаа" value={model.charge} placeholder="DC - 30 мин" />
            <TextInput name="seats" label="Суудал" value={model.seats} placeholder="2 суудал" hint="Хоёр хувилбартай бол ачааны хувилбарынх." />
            <TextInput name="seats_passenger" label="Суудал (зорчигчийн хувилбар)" value={model.seats_passenger} placeholder="6–14 суудал" hint="Зөвхөн ачаа/зорчигч хоёр хувилбартай загварт." />
            <TextInput name="payload" label="Даац" value={model.payload} placeholder="1,080 кг" />
            <TextInput name="doors" label="Хаалга" value={model.doors} placeholder="5 хаалга" />
            <TextInput name="door_label" label="Хаалганы гарчиг" value={model.door_label} placeholder="Хаалга" hint="Хоосон бол &quot;Хаалга&quot;." />
            <Select name="fuel" label="Түлш" value={toFuelType(model.fuel, model.engine)} options={[
              ["BEV", "BEV — цэвэр цахилгаан"], ["EREV", "EREV — зай сунгагчтай"], ["PHEV", "PHEV — залгууртай хайбрид"]
            ]} />
            <TextInput name="engine" label="Хөдөлгүүр" value={model.engine} placeholder="1,499 cc" hint="Зөвхөн EREV, PHEV загварт харагдана." />
          </div>
        </Panel>

        <Panel title="Онлайн урьдчилгаа" description="Бөглөвөл урьдчилсан захиалгын маягт энэ дүнг Byl-ээр (QPay, карт, банкны шилжүүлэг) төлүүлнэ. Хоосон бол урьдчилгаагүй, зөвхөн хүсэлт илгээнэ.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              name="deposit_amount" label="Урьдчилгаа (₮)" value={model.deposit_amount ? String(model.deposit_amount) : ""}
              placeholder="1000000" hint={shared > 1 ? `${model.name}-ийн бүх картад хамаарна.` : undefined}
            />
          </div>
        </Panel>

        <Panel title="Хэмнэлтийн тооцоолуур" description="Энэ загварыг ямар ижил ангиллын шатахуунт машинтай харьцуулах вэ. Хэрэглэгч тооцоолуур дээр зарцуулалтыг өөрөө өөрчилж болно.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput name="compare_name" label="Төстэй машин" value={model.compare_name} placeholder="Hyundai Porter II 2.5" />
            <Select name="compare_fuel" label="Түүний түлш" value={model.compare_fuel ?? "dt"} options={[["dt", "Дизель"], ["euro92", "Евро-92"], ["ai95", "АИ-95"]]} />
            <TextInput name="compare_consumption" label="Түүний зарцуулалт (л/100 км)" value={model.compare_consumption} placeholder="10.5" />
            <TextInput name="ev_consumption" label="Ruichi-н цахилгаан зарцуулалт (кВт·ц/100 км)" value={model.ev_consumption} placeholder="22" hint="Хоосон бол 22 гэж тооцно." />
          </div>
        </Panel>

        <Panel title="Гол үзүүлэлт" description="Эхний 3 нь зөвхөн нүүр хуудасны картад харагдана. &quot;Моторын хүч&quot;, &quot;Хурдан цэнэглэлт&quot;, &quot;Цэвэр цахилгаанаар&quot; гэсэн мөрүүдийн утгыг загварын хуудасны icon мөр ашиглана.">
          <StatsEditor initial={model.stats.map(toDraft)} variants={variants} />
        </Panel>

        <Panel
          title="Техникийн үзүүлэлт"
          description={showsSpec
            ? "1-р хэсэгт тоон үзүүлэлт, 2-р хэсэгт тоноглол. Мөрийн нэр, нэгж тогтмол тул зөвхөн утгыг бөглөнө. Сайт тохиргоонуудыг харьцуулж, бүгдэд байгаа тоноглолыг \"стандарт\" гэж автоматаар харуулна."
            : "Энэ загварын хуудас өөрийн техникийн хэсэгтэй (кодонд) тул энд оруулсан утга одоогоор сайтад харагдахгүй."}
        >
          <SpecSheetEditor initial={sheet} suggestions={suggestions} fuel={toFuelType(model.fuel, model.engine)} />
        </Panel>

        <div className="sticky bottom-4 z-10 flex items-center gap-4 rounded-2xl border border-line bg-white/95 p-4 shadow-[0_10px_30px_rgb(15_35_56/.12)] backdrop-blur">
          <SubmitButton>Хадгалах</SubmitButton>
          <span className="text-xs text-ink-muted">Хадгалмагц сайтад шууд гарна.</span>
        </div>
      </form>
    </>
  );
}
