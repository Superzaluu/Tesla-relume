// 100,000 ₮ bonus (/register/). Not deducted online: a pre-order whose phone matches a bonus
// registration is marked with bonus_amount, and the dealer deducts it from the final price.
// Matching and marking run with the service role, so visitors cannot give themselves a bonus.
import { serviceRest } from "@/lib/supabase-service";

/** Last 8 digits — "+976 9911 2233" and "99112233" are the same number. */
export const phoneDigits = (phone: string) => phone.replace(/\D/g, "").slice(-8);

/** Marks the pre-order with the bonus when its phone has a bonus registration. Returns the bonus or 0. */
export async function applyBonus(preorderId: string, phone: string): Promise<number> {
  const digits = phoneDigits(phone);
  if (digits.length < 8) return 0;
  const found = await serviceRest<{ bonus_amount: number }>(
    "GET", `bonus_registrations?phone_digits=eq.${digits}&status=neq.used&select=bonus_amount&order=created_at.asc&limit=1`
  );
  const bonus = Number(found?.[0]?.bonus_amount ?? 0);
  if (!bonus) return 0;
  const updated = await serviceRest("PATCH", `preorders?id=eq.${preorderId}`, { bonus_amount: bonus }, "return=minimal");
  return updated ? bonus : 0;
}
