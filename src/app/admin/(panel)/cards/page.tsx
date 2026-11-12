import Link from "next/link";
import { Notice, StatusBadge } from "@/components/admin/AdminUi";
import { listingThumb, type CategoryRow, type ListingRow } from "@/data/content";
import { requireAdmin } from "@/lib/supabase-auth";
import { setCardActive } from "../../actions";

type ModelName = { slug: string; name: string; description: string };

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: listings }, { data: models }] = await Promise.all([
    supabase.from("categories").select("id,label,sort").order("sort"),
    supabase.from("model_listings").select("*").order("sort").order("key"),
    supabase.from("models").select("slug,name,description")
  ]);
  const modelBySlug = new Map(((models ?? []) as ModelName[]).map((model) => [model.slug, model]));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-ink">Машины карт</h1>
          <p className="mt-1 text-small text-ink-secondary">Нүүр хуудасны &quot;Бүх загвар&quot;, дээд цэс, footer-т ангиллаар нь харагдана.</p>
        </div>
        <Link href="/admin/cards/new/" className="btn btn--primary px-5">+ Шинэ карт нэмэх</Link>
      </div>
      <Notice saved={saved} error={error} />

      <div className="space-y-8">
        {((categories ?? []) as CategoryRow[]).map((category) => {
          const items = ((listings ?? []) as ListingRow[]).filter((listing) => listing.category_id === category.id);
          return (
            <section key={category.id}>
              <h2 className="mb-3 text-small font-semibold uppercase tracking-wider text-ink-muted">{category.label} · {items.length}</h2>
              <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white p-0">
                {items.length === 0 && <li className="px-5 py-4 text-small text-ink-muted">Энэ ангилалд карт алга.</li>}
                {items.map((listing) => {
                  const model = modelBySlug.get(listing.model_slug);
                  return (
                    <li key={listing.key} className={`flex flex-wrap items-center gap-4 px-5 py-3 ${listing.active ? "" : "bg-[#fafbfc]"}`}>
                      <img src={listingThumb(listing)} alt="" className={`h-14 w-24 shrink-0 rounded-lg bg-[#f5f7fa] object-cover ${listing.active ? "" : "opacity-50"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">
                          {model?.name ?? listing.model_slug}
                          {listing.variant && <span className="ml-2 text-xs font-normal text-ink-muted">({listing.variant === "cargo" ? "ачааны" : "зорчигчийн"} хувилбар)</span>}
                        </p>
                        <p className="truncate text-small text-ink-muted">{listing.description || model?.description}</p>
                      </div>
                      <span className="text-xs text-ink-muted">Дараалал: {listing.sort}</span>
                      <StatusBadge active={listing.active} />
                      <div className="flex gap-2">
                        <Link href={`/admin/cards/${encodeURIComponent(listing.key)}/`} className="btn btn--secondary px-4">Засах</Link>
                        <form action={setCardActive}>
                          <input type="hidden" name="key" value={listing.key} />
                          <input type="hidden" name="active" value={listing.active ? "false" : "true"} />
                          <button type="submit" className="rounded-lg border border-line px-3 py-2 text-small text-ink hover:bg-[#f1f3f5]">
                            {listing.active ? "Нуух" : "Сэргээх"}
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-ink-muted">&quot;Нуух&quot; дарахад карт сайтаас алга болох ч мэдээлэл нь устахгүй. &quot;Сэргээх&quot;-ээр буцааж гаргана.</p>
    </>
  );
}
