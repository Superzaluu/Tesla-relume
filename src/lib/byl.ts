// Server-only client for the Byl payment API (https://byl.mn/docs/api).
// Env: BYL_PROJECT_ID, BYL_TOKEN (project API token), BYL_WEBHOOK_SECRET (endpoint signing secret).
// Never import this from a client component — the token must stay on the server.
import { createHmac, timingSafeEqual } from "node:crypto";

const BASE = "https://byl.mn/api/v1";

export const bylConfigured = () => Boolean(process.env.BYL_PROJECT_ID && process.env.BYL_TOKEN);

async function byl<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T | null> {
  const project = process.env.BYL_PROJECT_ID;
  const token = process.env.BYL_TOKEN;
  if (!project || !token) return null;
  try {
    const res = await fetch(`${BASE}/projects/${encodeURIComponent(project)}${path}`, {
      method: init?.method ?? "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) {
      console.error("Byl API error", res.status, path, (await res.text()).slice(0, 500));
      return null;
    }
    return ((await res.json()) as { data: T }).data;
  } catch (error) {
    console.error("Byl API request failed", path, error);
    return null;
  }
}

export type CheckoutInput = {
  /** Our pre-order id; comes back in the webhook as client_reference_id (≤ 48 chars). */
  reference: string;
  name: string;
  amount: number;
  email?: string;
  successUrl: string;
  cancelUrl: string;
};

/** Creates a hosted checkout for one item with a fixed price. Returns null on any failure. */
export function createCheckout(input: CheckoutInput) {
  return byl<{ id: number; url: string }>("/checkouts", {
    method: "POST",
    body: {
      items: [{ price_data: { unit_amount: input.amount, product_data: { name: input.name.slice(0, 255) } }, quantity: 1 }],
      client_reference_id: input.reference,
      customer_email: input.email || undefined,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl
    }
  });
}

export type Checkout = { id: number; status: "open" | "pending" | "complete" | "expired"; amount_total: number | string; client_reference_id: string | null };

export function getCheckout(id: number) {
  return byl<Checkout>(`/checkouts/${id}`);
}

/** Checks the Byl-Signature header: hex HMAC-SHA256 of the raw body with the endpoint's signing secret. */
export function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.BYL_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"));
  const given = Buffer.from(signature.trim());
  return expected.length === given.length && timingSafeEqual(expected, given);
}
