import { modelBySlug, modelHref } from "./models";
import { categoryOf, navigation } from "./navigation";
import type { QuickSpecs } from "./types";

export type HeroSlide = {
  id: string;
  /** Text colour scheme over the photo; `themeSm` applies in the stacked (mobile) layout. */
  theme: "dark" | "light";
  themeSm?: "dark" | "light";
  sky: string;
  eyebrow: string;
  model: string;
  subtitle: string;
  href: string;
  image: { src: string; width: number; height: number; alt: string; position?: string };
  messages?: string[];
  quick?: QuickSpecs;
};

// One hero slide per model, in menu order (navigation.ts). A new model gets a
// slide automatically from its data; `tuned` below only fine-tunes copy, colours
// and photo framing where the defaults are not good enough.
type Tuning = Partial<Omit<HeroSlide, "id" | "model" | "quick" | "image">> & { image?: Partial<HeroSlide["image"]> };

const tuned: Record<string, Tuning> = {
  ec75: { theme: "dark", sky: "#255681", eyebrow: "Цахилгаан фургон",
    subtitle: "Ажил хэрэгтээ тохирох найдвартай цахилгаан фургоноо сонгоорой.", href: modelHref("ec75", "cargo"),
    image: { src: "/assets/hero/ec75.jpg", width: 1920, height: 1028, alt: "Зам дээр явж буй цэнхэр EC75 цахилгаан фургон" },
    messages: ["Банкны хөнгөлттэй зээлээр ав", "Бензинд биш ирээдүйдээ мөнгө төл", "Бензинд цагаа бүү үр", "Бодит тав тухыг мэдэр"] },
  r5: { theme: "dark", themeSm: "light", sky: "#77a5c9", eyebrow: "Цахилгаан фургон",
    subtitle: "Ачааны болон зорчигчийн хувилбар · 403 км хүртэл цэнэглэлтийн зай", href: modelHref("r5", "cargo"),
    image: { src: "/assets/hero/r5.jpg", width: 1920, height: 1160, alt: "Ногоон R5 ачааны фургон ба цагаан R5 зорчигчийн фургон" } },
  c5: { theme: "light", sky: "#efeeea", eyebrow: "Шинэ үеийн ачааны машин",
    subtitle: "Цэвэр цахилгаан, CNG болон бензин зай сунгагчтай хувилбарууд", image: { alt: "Цагаан C5 цахилгаан ачааны машин" } },
  c3: { theme: "light", sky: "#d7e4ec", eyebrow: "Шинэ үеийн ачааны машин",
    subtitle: "Хотын хүргэлтэд зориулсан авсаархан, хэмнэлттэй ачааны машин", image: { alt: "Цагаан C3 ачааны машин" } },
  ed71s: { theme: "dark", themeSm: "light", sky: "#379cc6", eyebrow: "Бага оврын ачааны машин",
    subtitle: "Логистикт зориулсан цэвэр цахилгаан жижиг ачааны машин · EC31 цуврал",
    image: { alt: "Цагаан ED71S цахилгаан ачааны машин", position: "50% 0%" } },
  c9: { theme: "dark", sky: "#4973af", eyebrow: "Хөнгөн ачааны машин", subtitle: "Ruichi-ийн тэргүүлэх ухаалаг хөнгөн ачааны машин",
    image: { alt: "Саарал C9 хайрцагтай ачааны машин" } },
  ec35: { theme: "light", sky: "#bed0de", eyebrow: "Цахилгаан фургон", subtitle: "Хувиргах боломжтой зай бүхий логистикийн цахилгаан фургон",
    image: { alt: "Зам дээр явж буй мөнгөлөг EC35II цахилгаан фургон", position: "50% 0%" } },
  "c3-cold": { theme: "dark", sky: "#173245", subtitle: "Хүнс, эм тээвэрлэлтэд зориулсан хөргүүртэй ачааны машин",
    image: { alt: "Хөргүүртэй C3 ачааны машин" } },
  // Top-row colour and brightness measured from each photo.
  "ec75pro-passenger": { theme: "light", sky: "#acc8dd" }, "ec75pro-cargo": { theme: "light", sky: "#acc8dd" },
  "r5pro-passenger": { theme: "light", sky: "#a8c5db" }, "r5pro-cargo": { theme: "light", sky: "#a8c5db" },
  "c5-cng": { theme: "light", sky: "#efedea" }, "c5-reev": { theme: "light", sky: "#efedea" },
  c5l: { theme: "light", sky: "#cee7f4" }, ec31: { theme: "light", sky: "#c3c7d4" },
  ec31l: { theme: "light", sky: "#bcbfcc" }, ec31s: { theme: "light", sky: "#c7cdda" },
  "r5-service": { theme: "dark", sky: "#698292" }, "c5-drone": { theme: "dark", sky: "#606366" }
};

const menuSlugs = [...new Set(navigation.flatMap((category) => category.items.map((item) => item.slug)))];

export const heroSlides: HeroSlide[] = menuSlugs.map((slug) => {
  const model = modelBySlug(slug)!;
  const t = tuned[slug] ?? {};
  const base = model.page.hero.image;
  return {
    id: `hero-${slug}`,
    theme: t.theme ?? "light",
    themeSm: t.themeSm,
    sky: t.sky ?? "#d7e4ec",
    eyebrow: t.eyebrow ?? categoryOf(slug)?.label ?? "",
    model: model.name,
    subtitle: t.subtitle ?? model.desc,
    href: t.href ?? modelHref(slug),
    messages: t.messages,
    quick: model.quick,
    image: {
      src: t.image?.src ?? (base.src as string),
      width: t.image?.width ?? base.width,
      height: t.image?.height ?? base.height,
      alt: t.image?.alt ?? `${model.name} — ${model.desc}`,
      position: t.image?.position
    }
  };
});

export const pollChoices = ["Асуудалгүй", "Мэдэхгүй", "Муу байх"];

export const galleryImages = ["/assets/gallery-1.png", "/assets/gallery-2.png", "/assets/gallery-3.png"];

export const testDriveModels = ["EC75", "R5", "C5", "C3", "ED71S"];
