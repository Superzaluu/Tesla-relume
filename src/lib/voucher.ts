// Prize voucher for a pre-order (user test #1, 2026-11-23, item 8). Server only.
//
// The prize and the voucher code come from an HMAC of the pre-order id, so they are the same however often the
// wheel is spun (no re-rolling) and cannot be guessed from the id alone. They are also stored on the pre-order
// (migration 0019) when the service role is configured, so the dealer sees them in /admin.
// Delivery by e-mail / Facebook goes through an n8n webhook (env N8N_VOUCHER_WEBHOOK_URL), which the owner will
// set up later; without it the site runs in test mode and only shows the voucher on screen.
import { createHmac } from "node:crypto";
import { PRIZES, WHEEL, type Prize } from "@/data/prizes";
import { serviceConfigured, serviceRest } from "@/lib/supabase-service";

const secret = () => process.env.VOUCHER_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "ruichi-voucher-test";
const digest = (id: string, purpose: string) => createHmac("sha256", secret()).update(`${purpose}:${id}`).digest();

/** Weighted pick from the first 4 bytes of the HMAC. */
export function prizeFor(id: string): Prize {
  const total = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
  let roll = digest(id, "prize").readUInt32BE(0) % total;
  for (const prize of PRIZES) {
    if (roll < prize.weight) return prize;
    roll -= prize.weight;
  }
  return PRIZES[0];
}

/** Which of the wheel's slots holding this prize the pointer stops on (varies per order). */
export const wheelSlot = (id: string, prize: Prize) => {
  const slots = WHEEL.map((key, i) => (key === prize.key ? i : -1)).filter((i) => i >= 0);
  return slots[digest(id, "slot")[0] % slots.length];
};

// Crockford base32 without I, L, O, U: easy to read out over the phone.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
/** "RC-7K2M-9QXD": 40 bits of the HMAC. */
export function voucherCode(id: string) {
  const bytes = digest(id, "code");
  let bits = bytes[0] * 2 ** 32 + bytes.readUInt32BE(1); // 40 bits, exact in a double
  let out = "";
  for (let i = 0; i < 8; i++) { out = ALPHABET[bits % 32] + out; bits = Math.floor(bits / 32); }
  return `RC-${out.slice(0, 4)}-${out.slice(4)}`;
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** `demo` works outside production so the wheel and voucher can be tried without placing an order. */
export const isDemo = (id: string) => id === "demo" && process.env.NODE_ENV !== "production";

export type PreorderContact = {
  id: string; model_slug: string; model_name: string; variant: string | null; last_name: string; name: string;
  phone: string; email: string; facebook: string | null; voucher_code?: string | null; voucher_sent_at?: string | null;
};

/** The pre-order (service role). Null when it does not exist or the service role is not set up (test mode). */
export async function loadPreorder(id: string): Promise<PreorderContact | null> {
  if (!UUID.test(id) || !serviceConfigured()) return null;
  const rows = await serviceRest<PreorderContact>("GET", `preorders?id=eq.${id}&select=id,model_slug,model_name,variant,last_name,name,phone,email,facebook`);
  return rows?.[0] ?? null;
}

/** Saves the prize on the pre-order. Fails quietly before migration 0019 has run. */
export async function savePrize(id: string, prize: Prize, code: string) {
  return serviceRest("PATCH", `preorders?id=eq.${id}&voucher_code=is.null`, {
    prize_key: prize.key, prize_label: prize.label, voucher_code: code, prize_at: new Date().toISOString()
  });
}

export type SendState = "sent" | "test" | "failed";

/**
 * Hands the voucher to n8n, which e-mails it (with the barcode and the vehicle photo) and, when the buyer
 * messages the Facebook page, answers there. Payload documented in docs/n8n-voucher.md.
 */
export async function sendVoucher(payload: Record<string, unknown>): Promise<SendState> {
  const url = process.env.N8N_VOUCHER_WEBHOOK_URL;
  if (!url) {
    console.info("[voucher] test mode, not sent:", payload.code);
    return "test";
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.N8N_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET } : {}) },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
    return res.ok ? "sent" : "failed";
  } catch (error) {
    console.error("[voucher] webhook failed", error);
    return "failed";
  }
}
