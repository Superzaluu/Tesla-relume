import { catalogModels } from "./catalog";
import { ec75 } from "./ec75";
import { r5 } from "./r5";
import type { Model } from "./types";

export const models: Model[] = [ec75, r5, ...catalogModels];

export const modelBySlug = (slug: string) => models.find((model) => model.slug === slug);

export const modelHref = (slug: string, variant?: "cargo" | "passenger") => `/models/${slug}/${variant ? `#${variant}` : ""}`;
