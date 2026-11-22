"use client";
import type { SpinResult } from "@/app/preorder/prize-actions";
import { Voucher } from "@/components/forms/PrizeWheel";

/** The voucher alone (/preorder/voucher/): a client wrapper so the server page can render the barcode card. */
export function VoucherView({ result }: { result: Extract<SpinResult, { ok: true }> }) {
  return <Voucher result={{ ...result, sent: "sent", email: "" }} />;
}
