// Server-only helpers shared by the /preorder/ and /green-loan/ server actions.
import { getNavigation } from "@/data/content";

/** The menu card a "slug|variant" value refers to, or undefined when it is not a shown card. */
export async function findListing(value: string) {
  const [slug, variant = ""] = value.split("|");
  return (await getNavigation()).flatMap((category) => category.items)
    .find((entry) => entry.slug === slug && (entry.variant ?? "") === variant);
}

export const formText = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

/** Common checks for name and phone. Returns an error message or null. */
export function contactError(name: string, phone: string, note: string) {
  if (name.length < 2 || name.length > 80) return "Нэрээ бичнэ үү.";
  if (!/^[0-9+ -]{8,20}$/.test(phone)) return "Утасны дугаараа зөв бичнэ үү (жишээ нь 9911 2233).";
  if (note.length > 1000) return "Тайлбар 1000 тэмдэгтээс хэтэрсэн байна.";
  return null;
}

/**
 * Adds a row to public.preorders with the public key. Row Level Security lets visitors
 * insert a new request but never read one back, so nothing is returned.
 */
export async function insertPreorder(row: Record<string, unknown>): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return false;
  const res = await fetch(`${url}/rest/v1/preorders`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
    cache: "no-store"
  });
  if (!res.ok) console.error("preorder insert failed", res.status, await res.text());
  return res.ok;
}
