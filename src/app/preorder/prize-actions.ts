"use server";
// «Азын хүрд» spin for a pre-order (user test #1, 2026-11-23, item 8). The server decides the prize (src/lib/voucher.ts);
// the wheel in the browser only shows where it lands. Spinning again returns the same prize and code.
import { headers } from "next/headers";
import { brandName } from "@/data/brand";
import { getNavigation } from "@/data/content";
import { findListing } from "@/lib/preorders";
import { isDemo, loadPreorder, prizeFor, savePrize, sendVoucher, UUID, voucherCode, wheelSlot, type SendState } from "@/lib/voucher";

export type SpinResult =
  | { ok: true; slot: number; prizeKey: string; prizeLabel: string; code: string; model: string; image: string; voucherUrl: string; sent: SendState; email: string; facebook: boolean }
  | { ok: false; error: string };

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
}

export async function spinPrize(id: string): Promise<SpinResult> {
  if (!UUID.test(id) && !isDemo(id)) return { ok: false, error: "Захиалга олдсонгүй." };
  const row = isDemo(id) ? null : await loadPreorder(id);
  // With the service role set up, only a real pre-order can spin. Without it (local test) any uuid works.
  if (!row && !isDemo(id) && process.env.SUPABASE_SERVICE_ROLE_KEY) return { ok: false, error: "Захиалга олдсонгүй." };

  const prize = prizeFor(id);
  const code = voucherCode(id);
  const listing = row
    ? await findListing(`${row.model_slug}|${row.variant ?? ""}`)
    : (await getNavigation()).flatMap((category) => category.items).find((item) => !item.thumb.endsWith("coming-soon.svg"));
  const site = await origin();
  const image = listing?.thumb ? new URL(listing.thumb, site).toString() : `${site}/assets/order-models.png`;
  const model = brandName(row?.model_name ?? listing?.name ?? "");
  const voucherUrl = `${site}/preorder/voucher/?ref=${id}`;

  let sent: SendState = "test";
  if (row) {
    // Only the first spin saves and sends; a later one (page reload) just shows the same voucher.
    // Rows back = first spin; [] = saved before; null = migration 0019 not run yet (send anyway).
    const saved = await savePrize(id, prize, code);
    if (saved === null || saved.length > 0) {
      sent = await sendVoucher({
        type: "preorder_voucher", code, prize: prize.label, prize_key: prize.key, model, model_image: image, voucher_url: voucherUrl,
        name: row.name, last_name: row.last_name, email: row.email, phone: row.phone, facebook: row.facebook,
        messenger_ref: `voucher_${code}`, claim: "Машинаа хүлээн авахдаа энэ кодыг үзүүлж шагналаа авна."
      });
    } else sent = "sent";
  }
  return {
    ok: true, slot: wheelSlot(id, prize), prizeKey: prize.key, prizeLabel: prize.label, code, model, image, voucherUrl, sent,
    email: row?.email ?? "", facebook: Boolean(row?.facebook)
  };
}
