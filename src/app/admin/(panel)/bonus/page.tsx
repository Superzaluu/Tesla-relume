import { Notice } from "@/components/admin/AdminUi";
import { tugrik } from "@/data/greenLoan";
import { requireAdmin } from "@/lib/supabase-auth";
import { setBonusStatus } from "../../actions";

// 100,000 ₮ bonus registrations from /register/. A pre-order with the same phone shows "Бонустай";
// mark the registration "Ашигласан" once the bonus has been deducted from a sale.

type Row = {
  id: string; created_at: string; name: string; phone: string; facebook: string | null; models: string[];
  calc_model: string | null; calc_compare: string | null; calc_consumption: string | null; calc_distance: string | null;
  bonus_amount: number; status: "new" | "contacted" | "used";
};

const STATUSES = [
  { value: "new", label: "Шинэ", style: "bg-[#fff4d6] text-[#8a5a00]" },
  { value: "contacted", label: "Холбогдсон", style: "bg-[#e8f2ec] text-[#0f5a3a]" },
  { value: "used", label: "Ашигласан", style: "bg-[#f1f2f4] text-ink-muted" }
] as const;

const date = (iso: string) =>
  new Intl.DateTimeFormat("mn-MN", { timeZone: "Asia/Ulaanbaatar", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default async function BonusPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("bonus_registrations").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as Row[];

  return (
    <>
      <h1 className="text-[32px] font-bold tracking-tight text-ink">Бонус бүртгэл</h1>
      <p className="mb-6 mt-1 text-small text-ink-secondary">
        Хэмнэлтийн тооцоолуурын &quot;Бонус авах&quot;-аас ирсэн 100,000 ₮ бонусын бүртгэл. Ижил утсаар урьдчилсан захиалга өгвөл захиалга дээр &quot;Бонустай&quot; гэж гарна.
        Бонусыг машины эцсийн үнээс хасаад &quot;Ашигласан&quot; болгоорой.
      </p>
      <Notice error={error} />

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-small text-ink-muted">Бүртгэл алга.</p>
      ) : (
        <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white p-0">
          {rows.map((row) => {
            const status = STATUSES.find((item) => item.value === row.status) ?? STATUSES[0];
            return (
              <li key={row.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{row.name}</p>
                  <a href={`tel:${row.phone.replace(/[^0-9+]/g, "")}`} className="text-small font-semibold text-[#0f5a3a] hover:underline">{row.phone}</a>
                  {row.facebook && <p className="m-0 truncate text-xs text-ink-secondary">{row.facebook}</p>}
                  <p className="m-0 text-xs text-ink-muted">{date(row.created_at)} · {tugrik(row.bonus_amount)}</p>
                </div>
                <div className="min-w-0 text-small text-ink-secondary">
                  <p className="m-0"><span className="text-ink-muted">Сонирхсон:</span> {row.models.join(", ")}</p>
                  {row.calc_model && (
                    <p className="m-0 text-xs">
                      Тооцоолсон: {row.calc_model}{row.calc_compare ? ` ↔ ${row.calc_compare}` : ""}
                      {row.calc_consumption ? ` · ${row.calc_consumption}` : ""}{row.calc_distance ? ` · өдөрт ${row.calc_distance}` : ""}
                    </p>
                  )}
                </div>
                <form action={setBonusStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={row.id} />
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.style}`}>{status.label}</span>
                  <select name="status" defaultValue={row.status} aria-label="Төлөв солих" className="min-h-[36px] rounded-lg border border-line bg-white px-2 text-small text-ink">
                    {STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-small text-ink hover:bg-[#f1f3f5]">Хадгалах</button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
