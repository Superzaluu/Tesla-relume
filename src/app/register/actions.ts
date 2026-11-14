"use server";
// Saves a 100,000 ₮ bonus registration from /register/ (insert-only, see migration 0009).
import { formText, insertPublic } from "@/lib/preorders";

export type BonusState = { ok?: boolean; error?: string };

const short = (value: string, max: number) => (value ? value.slice(0, max) : null);

export async function submitBonus(_prev: BonusState, form: FormData): Promise<BonusState> {
  if (formText(form, "website")) return { ok: true }; // honeypot

  const name = formText(form, "name");
  const phone = formText(form, "phone");
  const facebook = formText(form, "facebook");
  const models = form.getAll("models").filter((value): value is string => typeof value === "string" && value.length > 0 && value.length <= 60);

  if (name.length < 2 || name.length > 80) return { error: "Нэрээ бичнэ үү." };
  if (!/^[0-9+ -]{8,20}$/.test(phone)) return { error: "Утасны дугаараа зөв бичнэ үү (жишээ нь 9911 2233)." };
  if (facebook.length > 200) return { error: "Facebook хаяг хэт урт байна." };
  if (models.length < 1 || models.length > 4) return { error: "Сонирхож буй дор хаяж нэг загвараа сонгоно уу." };

  const ok = await insertPublic("bonus_registrations", {
    name, phone, facebook: facebook || null, models,
    calc_model: short(formText(form, "ruichiModel"), 120),
    calc_compare: short(formText(form, "compareVehicle"), 120),
    calc_consumption: short(formText(form, "compareConsumption"), 40),
    calc_distance: short(formText(form, "dailyDistance"), 40)
  });
  return ok ? { ok: true } : { error: "Бүртгэлийг илгээж чадсангүй. Дахин оролдох эсвэл утсаар холбогдоно уу." };
}
