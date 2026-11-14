import type { Metadata } from "next";
import Link from "next/link";
import { DEPOSIT_REFUND_DAYS } from "@/data/preorder";
import { getCheckout } from "@/lib/byl";
import { markPaid } from "@/lib/deposits";
import { serviceRest } from "@/lib/supabase-service";

// Where Byl sends the buyer after paying. The webhook is the source of truth; this page also asks
// Byl directly (server-side), so the buyer sees the right state even if the webhook is late.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Урьдчилгаа — Ruichi", robots: { index: false } };

type Row = { id: string; model_name: string; payment_status: string; byl_checkout_id: number | null; byl_checkout_url: string | null; deposit_amount: number | null };

const money = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₮`;

async function load(ref: string): Promise<{ row: Row; state: string } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(ref)) return null;
  const rows = await serviceRest<Row>("GET", `preorders?id=eq.${ref}&select=id,model_name,payment_status,byl_checkout_id,byl_checkout_url,deposit_amount`);
  const row = rows?.[0];
  if (!row) return null;
  if (row.payment_status === "paid" || !row.byl_checkout_id) return { row, state: row.payment_status };
  const checkout = await getCheckout(row.byl_checkout_id);
  if (checkout?.status === "complete") {
    await markPaid(row.id, row.byl_checkout_id, checkout.amount_total);
    return { row, state: "paid" };
  }
  return { row, state: checkout?.status === "pending" ? "verifying" : checkout?.status === "expired" ? "expired" : row.payment_status };
}

export default async function PreorderSuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const result = await load(ref);
  const state = result?.state ?? "unknown";
  const name = result?.row.model_name;

  const view = {
    paid: { icon: "✓", title: "Урьдчилгаа төлөгдлөө", text: `${name ?? "Таны"} урьдчилсан захиалга баталгаажлаа${result?.row.deposit_amount ? ` (${money(result.row.deposit_amount)})` : ""}. Төлбөрийн баримт таны и-мэйл рүү очно. Манай зөвлөх тантай удахгүй холбогдоно.` },
    verifying: { icon: "…", title: "Шилжүүлэг шалгагдаж байна", text: "Банкны шилжүүлгийг дансны хуулгаар шалгаж баталгаажуулна. Баталгаажмагц и-мэйлээр мэдэгдэж, манай зөвлөх холбогдоно." },
    pending: { icon: "!", title: "Төлбөр хараахан хийгдээгүй байна", text: "Захиалга бүртгэгдсэн боловч урьдчилгаа төлөгдөөгүй байна. Доорх товчоор төлбөрөө үргэлжлүүлж болно." },
    expired: { icon: "!", title: "Төлбөрийн хугацаа дууссан", text: "Энэ төлбөрийн холбоосын хугацаа дууссан байна. Шинээр захиалга өгөх эсвэл манай зөвлөхтэй холбогдоно уу." },
    unknown: { icon: "✓", title: "Баярлалаа", text: "Таны хүсэлтийг хүлээн авлаа. Төлбөр баталгаажмагц и-мэйлээр мэдэгдэж, манай зөвлөх тантай холбогдоно." }
  }[state === "none" ? "unknown" : state] ?? { icon: "✓", title: "Баярлалаа", text: "" };

  return (
    <main className="tw bg-[#f5f7f8] pb-section-md pt-[calc(var(--navbar-height)+48px)]">
      <div className="mx-auto max-w-[720px] px-global">
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-8 text-center shadow-[0_10px_30px_rgb(15_35_56/.09)] md:p-12" role="status">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#eaf3ee] text-[28px] text-[#0f5a3a]" aria-hidden="true">{view.icon}</span>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">{view.title}</h1>
          <p className="mx-auto mt-2 max-w-[480px] text-regular text-ink-secondary">{view.text}</p>
          {state === "paid" && (
            <p className="mx-auto mt-3 max-w-[480px] text-xs text-ink-muted">Захиалгаа цуцалбал урьдчилгааг {DEPOSIT_REFUND_DAYS} хоногийн дотор буцаан олгоно.</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {state === "pending" && result?.row.byl_checkout_url && (
              <a className="btn btn--primary px-6" href={result.row.byl_checkout_url}>Төлбөрөө үргэлжлүүлэх</a>
            )}
            <Link className="btn btn--tint px-6" href="/">Нүүр хуудас</Link>
            <Link className="btn btn--secondary px-6" href="/#models">Бусад загвар үзэх</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
