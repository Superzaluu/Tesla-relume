// Builds the homepage "Бүх загвар" cards from the menu (navigation.ts) and the
// model data, so a new model only needs to be added there.
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { modelBySlug } from "./models";
import { navigation } from "./navigation";
import { pick, type Variant } from "./types";

export const modelCards: ModelCardData[] = navigation.flatMap((category) =>
  category.items.map((item) => {
    const model = modelBySlug(item.slug)!;
    const variant: Variant = item.key.endsWith("-passenger") ? "passenger" : "cargo";
    const stats = model.page.stats.slice(0, 3).map((stat) => ({
      value: pick(stat.value, variant), unit: pick(stat.unit, variant), label: pick(stat.label, variant)
    }));
    return {
      key: item.key, href: item.href, thumb: item.thumb, name: item.name, desc: item.desc,
      categoryId: category.id, category: category.label, stats, quick: model.quick
    };
  })
);

export const modelCardCategories = navigation.map((category) => ({ id: category.id, label: category.label }));
