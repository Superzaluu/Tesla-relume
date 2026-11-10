import { models } from "./models";

export const navigation = [
  { label: "Зорчигч тээвэр", slugs: ["ec75", "ec75pro-passenger", "r5", "r5pro-passenger"] },
  { label: "Ачаа хүргэлтийн фургон", slugs: ["ec75", "ec75pro-cargo", "r5", "r5pro-cargo", "ec35"] },
  { label: "Задгай тэвштэй машин", slugs: ["c5", "c5-cng", "c5-reev", "c3", "ed71s", "ec31l"] },
  { label: "Битүү тэвштэй машин", slugs: ["ec31", "ec31s", "c5l", "c9"] },
  { label: "Хөргүүртэй машин", slugs: ["c3-cold"] },
  { label: "Тусгай зориулалтын машин", slugs: ["r5-service", "c5-drone"] }
].map((group) => ({ ...group, items: group.slugs.map((slug) => models.find((model) => model.slug === slug)!) }));
