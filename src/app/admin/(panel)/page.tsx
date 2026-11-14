import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-auth";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const [{ data: listings }, { data: slides }, { count: newPreorders }] = await Promise.all([
    supabase.from("model_listings").select("active"),
    supabase.from("hero_slides").select("active"),
    supabase.from("preorders").select("id", { count: "exact", head: true }).eq("status", "new")
  ]);
  const count = (rows: { active: boolean }[] | null) => ({
    shown: (rows ?? []).filter((row) => row.active).length,
    hidden: (rows ?? []).filter((row) => !row.active).length
  });
  const tiles = [
    { href: "/admin/cards/", title: "Машины карт", text: "Нүүр хуудасны \"Бүх загвар\" картууд, цэс, загварын үзүүлэлт, техникийн хүснэгт.", ...count(listings) },
    { href: "/admin/hero/", title: "Hero слайд", text: "Нүүр хуудасны дээд хэсгийн слайдууд: зураг, текст, өнгө, дараалал.", ...count(slides) }
  ];

  return (
    <>
      <h1 className="text-[32px] font-bold tracking-tight text-ink">Сайн байна уу!</h1>
      <p className="mt-1 text-medium text-ink-secondary">Засах хэсгээ сонгоно уу. Хадгалсан өөрчлөлт сайтад шууд гарна.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="group rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgb(15_35_56/.09)]">
            <h2 className="text-[22px] font-bold text-ink group-hover:text-[#0f5a3a]">{tile.title} →</h2>
            <p className="mt-2 text-small text-ink-secondary">{tile.text}</p>
            <p className="mt-4 text-small text-ink-muted">
              <strong className="text-ink">{tile.shown}</strong> харагдаж байна{tile.hidden > 0 && <> · <strong className="text-ink">{tile.hidden}</strong> нуусан</>}
            </p>
          </Link>
        ))}
        <Link href="/admin/preorders/?status=new" className="group rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgb(15_35_56/.09)]">
          <h2 className="text-[22px] font-bold text-ink group-hover:text-[#0f5a3a]">Урьдчилсан захиалга →</h2>
          <p className="mt-2 text-small text-ink-secondary">Сайтаас ирсэн захиалга: загвар, нэр, утас, төлбөрийн хэлбэр, тайлбар.</p>
          <p className="mt-4 text-small text-ink-muted"><strong className="text-ink">{newPreorders ?? 0}</strong> шинэ (холбогдоогүй)</p>
        </Link>
      </div>
    </>
  );
}
