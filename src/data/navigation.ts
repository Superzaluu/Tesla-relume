// Menu types. The categories and their models come from Supabase
// (tables `categories` and `model_listings`), loaded by getNavigation() in content.ts.
import type { CategoryId, Variant } from "./types";

/** priceFrom: «Эхлэх үнэ» in ₮, the lowest trim's dealer price (model_listings.price_from). */
export type NavItem = { key: string; slug: string; variant?: Variant; name: string; desc: string; href: string; thumb: string; priceFrom?: number };
export type NavCategory = { id: CategoryId; label: string; items: NavItem[] };
