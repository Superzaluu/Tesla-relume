// Menu types. The categories and their models come from Supabase
// (tables `categories` and `model_listings`), loaded by getNavigation() in content.ts.
import type { CategoryId, Variant } from "./types";

export type NavItem = { key: string; slug: string; variant?: Variant; name: string; desc: string; href: string; thumb: string };
export type NavCategory = { id: CategoryId; label: string; items: NavItem[] };
