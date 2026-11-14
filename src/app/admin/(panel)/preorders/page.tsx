import Link from "next/link";
import { Notice } from "@/components/admin/AdminUi";
import { tugrik } from "@/data/greenLoan";
import { PAYMENTS, PREORDER_STATUSES, type PreorderRow, type PreorderStatus } from "@/data/preorder";
import { requireAdmin } from "@/lib/supabase-auth";
import { setPreorderStatus } from "../../actions";

const STATUS_STYLE: Record<PreorderStatus, string> = {
  new: "bg-[#fff4d6] text-[#8a5a00]",
  contacted: "bg-[#e8f2ec] text-[#0f5a3a]",
  closed: "bg-[#f1f2f4] text-ink-muted"
};
const label = <T extends { value: string; label: string }>(list: readonly T[], value: string) => list.find((item) => item.value === value)?.label ?? value;
const date = (iso: string) =>
  new Intl.DateTimeFormat("mn-MN", { timeZone: "Asia/Ulaanbaatar", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default async function PreordersPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  const { status, error } = await searchParams;
  const filter = PREORDER_STATUSES.some((option) => option.value === status) ? (status as PreorderStatus) : undefined;
  const { supabase } = await requireAdmin();
  const [{ data }, { data: all }] = await Promise.all([
    (filter ? supabase.from("preorders").select("*").eq("status", filter) : supabase.from("preorders").select("*"))
      .order("created_at", { ascending: false }).limit(200),
    supabase.from("preorders").select("status")
  ]);
  const rows = (data ?? []) as PreorderRow[];
  const counts = new Map<string, number>();
  for (const row of (all ?? []) as { status: string }[]) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  const chips = [{ value: "", label: "Бүгд", count: (all ?? []).length }, ...PREORDER_STATUSES.map((option) => ({ ...option, count: counts.get(option.value) ?? 0 }))];

  return (
    <>
      <h1 className="text-[32px] font-bold tracking-tight text-ink">Урьдчилсан захиалга</h1>
      <p className="mb-6 mt-1 text-small text-ink-secondary">Сайтын /preorder/ болон /green-loan/ хуудаснаас ирсэн хүсэлтүүд. Холбогдсоныхоо дараа төлвийг нь солиорой.</p>
      <Notice error={error} />

      <nav className="mb-5 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = (filter ?? "") === chip.value;
          return (
            <Link key={chip.value} href={chip.value ? `/admin/preorders/?status=${chip.value}` : "/admin/preorders/"}
              className={`rounded-full border px-4 py-1.5 text-small font-semibold ${active ? "border-[#0f5a3a] bg-[#0f5a3a] text-white" : "border-line bg-white text-ink-secondary hover:text-ink"}`}>
              {chip.label} <span className={active ? "text-white/70" : "text-ink-muted"}>{chip.count}</span>
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-small text-ink-muted">Захиалга алга.</p>
      ) : (
        <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white p-0">
          {rows.map((row) => (
            <li key={row.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.6fr)_auto] md:items-center">
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {row.model_name}
                  {row.variant && <span className="ml-2 text-xs font-normal text-ink-muted">({row.variant === "cargo" ? "ачааны" : "зорчигчийн"})</span>}
                </p>
                <p className="text-xs text-ink-muted">
                  {date(row.created_at)} · {label(PAYMENTS, row.payment)}
                  {row.source === "green_loan" && <span className="ml-1.5 rounded-full bg-[#eaf3ee] px-2 py-0.5 font-semibold text-[#0f5a3a]">Тооцоолуураас</span>}
                </p>
                {row.source === "green_loan" && row.vehicle_price && (
                  <p className="mt-1 text-xs text-ink-secondary">
                    Үнэ {tugrik(row.vehicle_price)} · урьдчилгаа {tugrik(row.down_payment ?? 0)} · {row.term_months} сар ·{" "}
                    {row.income_type === "business" ? "бизнесийн" : "цалингийн"} орлого · <strong className="text-ink">сард ≈ {tugrik(row.monthly_payment ?? 0)}</strong>
                  </p>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{row.name}</p>
                <a href={`tel:${row.phone.replace(/[^0-9+]/g, "")}`} className="text-small font-semibold text-[#0f5a3a] hover:underline">{row.phone}</a>
              </div>
              <p className="m-0 whitespace-pre-line text-small text-ink-secondary">{row.note || <span className="text-ink-muted">—</span>}</p>
              <form action={setPreorderStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="filter" value={filter ?? ""} />
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[row.status]}`}>{label(PREORDER_STATUSES, row.status)}</span>
                <select name="status" defaultValue={row.status} aria-label="Төлөв солих" className="min-h-[36px] rounded-lg border border-line bg-white px-2 text-small text-ink">
                  {PREORDER_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-small text-ink hover:bg-[#f1f3f5]">Хадгалах</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {rows.length === 200 && <p className="mt-4 text-xs text-ink-muted">Сүүлийн 200 захиалгыг харуулж байна.</p>}
    </>
  );
}
