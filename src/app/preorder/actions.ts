"use server";
// Saves a pre-order from /preorder/ (see src/lib/preorders.ts for how it is stored).
import { PAYMENTS } from "@/data/preorder";
import { contactError, findListing, formText, insertPreorder } from "@/lib/preorders";

export type PreorderState = { ok?: boolean; error?: string };

export async function submitPreorder(_prev: PreorderState, form: FormData): Promise<PreorderState> {
  // Bots fill every field; people never see this one.
  if (formText(form, "website")) return { ok: true };

  const item = await findListing(formText(form, "model"));
  const name = formText(form, "name");
  const phone = formText(form, "phone");
  const payment = formText(form, "payment");
  const note = formText(form, "note");

  if (!item) return { error: "Загвараа сонгоно уу." };
  const invalid = contactError(name, phone, note);
  if (invalid) return { error: invalid };
  if (!PAYMENTS.some((option) => option.value === payment)) return { error: "Төлбөрийн хэлбэрээ сонгоно уу." };

  const ok = await insertPreorder({
    model_slug: item.slug, model_name: item.name, variant: item.variant ?? null,
    name, phone, payment, note: note || null
  });
  return ok ? { ok: true } : { error: "Захиалгыг илгээж чадсангүй. Дахин оролдох эсвэл утсаар холбогдоно уу." };
}
