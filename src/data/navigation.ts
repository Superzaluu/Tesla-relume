import { models } from "./models";

type Group = { label: string; desc?: string; slugs: string[] };

// `desc` нь тухайн ангилал доторх загвар бүрийн ард харагдах тайлбар.
// Тодорхойлоогүй бол загварын өөрийн `category` ашиглагдана.
const groups: Group[] = [
  { label: "Зорчигч тээвэр", desc: "Зорчигч тээврийн машин", slugs: ["ec75", "ec75pro-passenger", "r5", "r5pro-passenger"] },
  { label: "Ачаа хүргэлтийн фургон", desc: "Ачаа тээврийн фургон", slugs: ["ec75", "ec75pro-cargo", "r5", "r5pro-cargo", "ec35"] },
  { label: "Задгай тэвштэй машин", slugs: ["c5", "c5-cng", "c5-reev", "c3", "ed71s", "ec31l"] },
  { label: "Битүү тэвштэй машин", slugs: ["ec31", "ec31s", "c5l", "c9"] },
  { label: "Хөргүүртэй машин", slugs: ["c3-cold"] },
  { label: "Тусгай зориулалтын машин", slugs: ["r5-service", "c5-drone"] }
];

const thumbFor = (slug: string, desc?: string) => {
  if (slug === "ec75" || slug === "r5") return `/assets/thumbs/${slug}-${desc?.startsWith("Зорчигч") ? "passenger" : "cargo"}.jpg`;
  return `/assets/thumbs/${slug}.jpg`;
};

export const navigation = groups.map((group) => ({
  label: group.label,
  items: group.slugs.map((slug) => {
    const model = models.find((item) => item.slug === slug);
    if (!model) throw new Error(`navigation: "${slug}" загвар models.ts-д алга`);
    return { slug, name: model.name, desc: group.desc ?? model.category, thumb: thumbFor(slug, group.desc), href: `/models/${slug}/` };
  })
}));
