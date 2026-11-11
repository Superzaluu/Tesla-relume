// Menu categories. Used by the header dropdowns, the footer model list,
// the homepage "Бүх загвар" slider and the registration form.
import { modelBySlug, modelHref } from "./models";
import type { CategoryId, Variant } from "./types";

type Entry = { slug: string; variant?: Variant; desc?: string };

const categories: { id: CategoryId; label: string; models: Entry[] }[] = [
  { id: "passenger", label: "Зорчигч тээвэр", models: [
    { slug: "ec75", variant: "passenger", desc: "Зорчигч тээврийн машин" }, { slug: "ec75pro-passenger" },
    { slug: "r5", variant: "passenger", desc: "Зорчигч тээврийн машин" }, { slug: "r5pro-passenger" }
  ] },
  { id: "cargo-van", label: "Ачаа хүргэлтийн фургон", models: [
    { slug: "ec75", variant: "cargo", desc: "Ачаа тээврийн машин" }, { slug: "ec75pro-cargo" },
    { slug: "r5", variant: "cargo", desc: "Ачаа тээврийн машин" }, { slug: "r5pro-cargo" }, { slug: "ec35" }
  ] },
  { id: "flatbed", label: "Задгай тэвштэй машин", models: [
    { slug: "c5" }, { slug: "c5-cng" }, { slug: "c5-reev" }, { slug: "c3" }, { slug: "ed71s" }, { slug: "ec31l" }
  ] },
  { id: "box", label: "Битүү тэвштэй машин", models: [{ slug: "ec31" }, { slug: "ec31s" }, { slug: "c5l" }, { slug: "c9" }] },
  { id: "refrigerated", label: "Хөргүүртэй машин", models: [{ slug: "c3-cold" }] },
  { id: "special", label: "Тусгай зориулалтын машин", models: [{ slug: "r5-service" }, { slug: "c5-drone" }] }
];

export type NavItem = { key: string; slug: string; name: string; desc: string; href: string; thumb: string };
export type NavCategory = { id: CategoryId; label: string; items: NavItem[] };

export const navigation: NavCategory[] = categories.map((category) => ({
  id: category.id,
  label: category.label,
  items: category.models.map(({ slug, variant, desc }) => {
    const model = modelBySlug(slug);
    if (!model) throw new Error(`navigation: unknown model "${slug}"`);
    const key = variant ? `${slug}-${variant}` : slug;
    return { key, slug, name: model.name, desc: desc ?? model.desc, href: modelHref(slug, variant), thumb: `/assets/thumbs/${key}.jpg` };
  })
}));

export const categoryOf = (slug: string) => navigation.find((category) => category.items.some((item) => item.slug === slug));
