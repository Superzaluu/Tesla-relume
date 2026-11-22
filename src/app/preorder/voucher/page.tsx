import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VoucherView } from "@/components/forms/VoucherView";
import { brandName } from "@/data/brand";
import { getNavigation } from "@/data/content";
import { findListing } from "@/lib/preorders";
import { isDemo, loadPreorder, prizeFor, voucherCode } from "@/lib/voucher";

// The voucher on its own page (the link in the e-mail / Messenger, user test #1 item 8). Only someone with the
// pre-order's id (an unguessable uuid) can open it; the code itself is an HMAC of that id.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Шагналын купон — Ruichi", robots: { index: false } };

export default async function VoucherPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const row = isDemo(ref) ? null : await loadPreorder(ref);
  if (!row && !isDemo(ref)) notFound();
  const listing = row
    ? await findListing(`${row.model_slug}|${row.variant ?? ""}`)
    : (await getNavigation()).flatMap((category) => category.items).find((item) => !item.thumb.endsWith("coming-soon.svg"));
  const prize = prizeFor(ref);
  return (
    <main className="tw bg-[#f5f7f8] pb-section-md pt-[calc(var(--navbar-height)+48px)]">
      <div className="mx-auto max-w-[760px] px-global">
        <VoucherView
          result={{
            ok: true, slot: 0, prizeKey: prize.key, prizeLabel: prize.label, code: voucherCode(ref),
            model: brandName(row?.model_name ?? listing?.name ?? ""), image: listing?.thumb ?? "/assets/order-models.png",
            voucherUrl: `/preorder/voucher/?ref=${ref}`, sent: "sent", email: "", facebook: Boolean(row?.facebook)
          }}
        />
        <p className="mt-6 text-center"><Link className="btn btn--tint px-6" href="/">Нүүр хуудас</Link></p>
      </div>
    </main>
  );
}
