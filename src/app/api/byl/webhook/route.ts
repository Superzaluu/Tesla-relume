// Byl webhook endpoint. Register it in Byl as  https://<domain>/api/byl/webhook/  — with the trailing
// slash: the site uses trailingSlash, and Byl counts a redirect as a failed delivery.
//
// Every request must carry a valid Byl-Signature (HMAC-SHA256 of the raw body). Only then is a
// pre-order marked paid. Byl retries failed deliveries for ~4 days, so handling is idempotent.
import { getCheckout, verifySignature } from "@/lib/byl";
import { markPaid, markVerifying } from "@/lib/deposits";
import { serviceRest } from "@/lib/supabase-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Event = {
  id: number;
  project_id: number;
  type: string;
  data?: { object?: Record<string, unknown> & { id?: number; client_reference_id?: string | null; amount_total?: string | number; payable?: { type?: string; id?: number } } };
};

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("byl-signature"))) {
    return new Response("invalid signature", { status: 401 });
  }

  let event: Event;
  try { event = JSON.parse(raw) as Event; } catch { return new Response("bad json", { status: 400 }); }

  // Another project's event (a shared team secret): acknowledge and ignore.
  if (String(event.project_id) !== process.env.BYL_PROJECT_ID) return new Response("ignored", { status: 200 });

  const object = event.data?.object;
  let ok = true;

  if (event.type === "checkout.completed" && object?.id && object.client_reference_id) {
    // Confirm with Byl itself before recording money as received.
    const checkout = await getCheckout(object.id);
    ok = checkout?.status === "complete"
      ? await markPaid(object.client_reference_id, object.id, checkout.amount_total ?? object.amount_total ?? 0)
      : false;
  } else if (event.type === "payment.awaiting_verification" && object?.payable?.type === "checkout" && object.payable.id) {
    ok = await markVerifying(object.payable.id);
  }

  // A failed update returns 500 so Byl retries later; the updates themselves are safe to repeat.
  if (!ok) return new Response("retry", { status: 500 });
  await serviceRest("POST", "byl_events?on_conflict=id", { id: event.id, type: event.type }, "resolution=ignore-duplicates,return=minimal");
  return new Response("ok", { status: 200 });
}
