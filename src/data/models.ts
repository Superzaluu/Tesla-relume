import { catalogModels } from "./catalog";
import { ec75 } from "./ec75";
import { r5 } from "./r5";
import type { Model } from "./types";

export const models: Model[] = [ec75, r5, ...catalogModels];

export const modelBySlug = (slug: string) => models.find((model) => model.slug === slug);

export const modelHref = (slug: string, variant?: "cargo" | "passenger") => `/models/${slug}/${variant ? `#${variant}` : ""}`;
/** Green loan calculator with the model already chosen. */
export const greenLoanHref = (slug: string) => `/green-loan/?model=${encodeURIComponent(slug)}`;
/** Pre-order page with the model (and variant) already chosen. */
export const preorderHref = (slug: string, variant?: "cargo" | "passenger") =>
  `/preorder/?model=${encodeURIComponent(slug)}${variant ? `&variant=${variant}` : ""}`;
