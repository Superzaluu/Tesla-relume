"use server";
// Saves a green loan request from /green-loan/ into the pre-order inbox (payment = green_loan).
// The payment is recalculated here, so the saved numbers never depend on what the browser sent.
import { calculateLoan, MAX_TERM, MIN_TERM, type IncomeType } from "@/data/greenLoan";
import { contactError, findListing, formText, insertPreorder } from "@/lib/preorders";

export type GreenLoanState = { ok?: boolean; error?: string };

export async function submitGreenLoan(_prev: GreenLoanState, form: FormData): Promise<GreenLoanState> {
  if (formText(form, "website")) return { ok: true };

  const item = await findListing(formText(form, "model"));
  const income = formText(form, "income") as IncomeType;
  const price = Number(formText(form, "price").replace(/[^0-9]/g, ""));
  const downPercent = Number(formText(form, "downPercent"));
  const months = Number(formText(form, "months"));
  const realEstate = formText(form, "realEstate") === "on";
  const name = formText(form, "name");
  const phone = formText(form, "phone");
  const note = formText(form, "note");

  if (!item) return { error: "Загвараа сонгоно уу." };
  if (income !== "salary" && income !== "business") return { error: "Орлогын төрлөө сонгоно уу." };
  if (!Number.isFinite(price) || price < 1_000_000 || price > 2_000_000_000) return { error: "Машины үнийг зөв оруулна уу." };
  if (!Number.isFinite(downPercent) || downPercent < 0 || downPercent > 90) return { error: "Урьдчилгааны хувийг зөв сонгоно уу." };
  if (!Number.isFinite(months) || months < MIN_TERM || months > MAX_TERM[income]) return { error: "Зээлийн хугацааг зөв сонгоно уу." };
  const invalid = contactError(name, phone, note);
  if (invalid) return { error: invalid };

  const result = calculateLoan({ price, downPercent, months, income, realEstate });
  const extra = [realEstate && "Үл хөдлөх хөрөнгө барьцаалах боломжтой", note].filter(Boolean).join("\n");

  const ok = await insertPreorder({
    source: "green_loan", payment: "green_loan",
    model_slug: item.slug, model_name: item.name, variant: item.variant ?? null,
    name, phone, note: extra || null,
    income_type: income, vehicle_price: price, down_payment: result.downPayment,
    term_months: Math.round(months), monthly_payment: result.monthly
  });
  return ok ? { ok: true } : { error: "Хүсэлтийг илгээж чадсангүй. Дахин оролдох эсвэл утсаар холбогдоно уу." };
}
