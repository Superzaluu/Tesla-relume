"use server";
// Saves a pre-order from /preorder/ (see src/lib/preorders.ts for how it is stored).
// Models with a deposit (models.deposit_amount) continue to a Byl checkout; the deposit amount
// is always read on the server, never taken from the form.
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PAYMENTS } from "@/data/preorder";
import { bylConfigured, createCheckout } from "@/lib/byl";
import { getDeposits } from "@/lib/deposits";
import { contactError, findListing, formText, insertPreorder } from "@/lib/preorders";

export type PreorderState = { ok?: boolean; error?: string; paymentFailed?: boolean };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function submitPreorder(_prev: PreorderState, form: FormData): Promise<PreorderState> {
  // Bots fill every field; people never see this one.
  if (formText(form, "website")) return { ok: true };

  const item = await findListing(formText(form, "model"));
  const lastName = formText(form, "last_name");
  const name = formText(form, "name");
  const phone = formText(form, "phone");
  const email = formText(form, "email");
  const facebook = formText(form, "facebook");
  const payment = formText(form, "payment");
  const note = formText(form, "note");

  if (!item) return { error: "Загвараа сонгоно уу." };
  if (lastName.length < 1 || lastName.length > 80) return { error: "Овгоо бичнэ үү." };
  const invalid = contactError(name, phone, note);
  if (invalid) return { error: invalid };
  if (!EMAIL.test(email) || email.length > 160) return { error: "И-мэйл хаягаа зөв бичнэ үү." };
  if (facebook.length > 120) return { error: "Facebook нэр хэт урт байна." };
  if (!PAYMENTS.some((option) => option.value === payment)) return { error: "Төлбөрийн хэлбэрээ сонгоно уу." };

  const id = randomUUID();
  const row = {
    id, model_slug: item.slug, model_name: item.name, variant: item.variant ?? null,
    last_name: lastName, name, phone, email, facebook: facebook || null, payment, note: note || null
  };
  const failed = { error: "Захиалгыг илгээж чадсангүй. Дахин оролдох эсвэл утсаар холбогдоно уу." };

  const deposit = (await getDeposits())[item.slug];
  if (!deposit || !bylConfigured()) {
    return (await insertPreorder(row)) ? { ok: true } : failed;
  }

  const origin = await siteOrigin();
  const back = `/preorder/?model=${encodeURIComponent(item.slug)}${item.variant ? `&variant=${item.variant}` : ""}`;
  const checkout = await createCheckout({
    reference: id,
    name: `${item.name} — урьдчилсан захиалгын урьдчилгаа`,
    amount: deposit,
    email,
    successUrl: `${origin}/preorder/success/?ref=${id}`,
    cancelUrl: `${origin}${back}`
  });

  // Byl unavailable: keep the request so the dealer can still call, and say the payment did not start.
  if (!checkout) return (await insertPreorder(row)) ? { ok: true, paymentFailed: true } : failed;

  const saved = await insertPreorder({
    ...row, payment_status: "pending", deposit_amount: deposit, byl_checkout_id: checkout.id, byl_checkout_url: checkout.url
  });
  if (!saved) return failed;
  redirect(checkout.url);
}
