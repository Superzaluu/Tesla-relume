// Pre-order deposits: which models take an online deposit and how a paid checkout is recorded.
import { select } from "@/lib/supabase";
import { serviceRest } from "@/lib/supabase-service";

/** model slug → deposit in MNT, for models with an online deposit. */
export async function getDeposits(): Promise<Record<string, number>> {
  const rows = await select<{ slug: string; deposit_amount: number }>("models", "select=slug,deposit_amount&deposit_amount=not.is.null");
  return Object.fromEntries(rows.map((row) => [row.slug, Number(row.deposit_amount)]));
}

/**
 * Marks a pre-order paid. Matches both our id and the checkout id we stored, so a checkout can
 * only ever pay the pre-order it was created for. Safe to repeat (webhook retries, return page).
 */
export async function markPaid(reference: string, checkoutId: number, amount: number | string) {
  if (!/^[0-9a-f-]{36}$/i.test(reference)) return false;
  const rows = await serviceRest<{ id: string }>(
    "PATCH",
    `preorders?id=eq.${reference}&byl_checkout_id=eq.${checkoutId}&payment_status=neq.paid`,
    { payment_status: "paid", paid_amount: Number(amount), paid_at: new Date().toISOString() }
  );
  return rows !== null;
}

/** Bank transfer reported by the buyer; waits for the dealer to confirm it in Byl. */
export async function markVerifying(checkoutId: number) {
  const rows = await serviceRest("PATCH", `preorders?byl_checkout_id=eq.${checkoutId}&payment_status=eq.pending`, { payment_status: "verifying" });
  return rows !== null;
}
