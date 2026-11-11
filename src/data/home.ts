import { modelBySlug, modelHref } from "./models";
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

const slide = (s: Omit<HeroSlide, "quick">, slug: string): HeroSlide => ({ ...s, quick: modelBySlug(slug)?.quick });

export const heroSlides: HeroSlide[] = [
  slide({ id: "hero-ec75", theme: "dark", sky: "#255681", eyebrow: "Цахилгаан фургон", model: "EC75",
    subtitle: "Ажил хэрэгтээ тохирох найдвартай цахилгаан фургоноо сонгоорой.", href: modelHref("ec75", "cargo"),
    image: { src: "/assets/hero/ec75.jpg", width: 1920, height: 1028, alt: "Зам дээр явж буй цэнхэр EC75 цахилгаан фургон" },
    messages: ["Банкны хөнгөлттэй зээлээр ав", "Бензинд биш ирээдүйдээ мөнгө төл", "Бензинд цагаа бүү үр", "Бодит тав тухыг мэдэр"] }, "ec75"),
  slide({ id: "hero-r5", theme: "dark", themeSm: "light", sky: "#77a5c9", eyebrow: "Цахилгаан фургон", model: "R5",
    subtitle: "Ачааны болон зорчигчийн хувилбар · 403 км хүртэл цэнэглэлтийн зай", href: modelHref("r5", "cargo"),
    image: { src: "/assets/hero/r5.jpg", width: 1920, height: 1160, alt: "Ногоон R5 ачааны фургон ба цагаан R5 зорчигчийн фургон" } }, "r5"),
  slide({ id: "hero-c5", theme: "light", sky: "#efeeea", eyebrow: "Шинэ үеийн ачааны машин", model: "C5",
    subtitle: "Цэвэр цахилгаан, CNG болон бензин зай сунгагчтай хувилбарууд", href: modelHref("c5"),
    image: { src: "/assets/hero/c5.jpg", width: 1920, height: 1160, alt: "Цагаан C5 цахилгаан ачааны машин" } }, "c5"),
  slide({ id: "hero-c3", theme: "light", sky: "#d7e4ec", eyebrow: "Шинэ үеийн ачааны машин", model: "C3",
    subtitle: "Хотын хүргэлтэд зориулсан авсаархан, хэмнэлттэй ачааны машин", href: modelHref("c3"),
    image: { src: "/assets/hero/c3.jpg", width: 1920, height: 1160, alt: "Цагаан C3 ачааны машин" } }, "c3"),
  slide({ id: "hero-ed71s", theme: "dark", themeSm: "light", sky: "#379cc6", eyebrow: "Бага оврын ачааны машин", model: "ED71S",
    subtitle: "Логистикт зориулсан цэвэр цахилгаан жижиг ачааны машин · EC31 цуврал", href: modelHref("ed71s"),
    image: { src: "/assets/hero/ed71s.jpg", width: 1920, height: 1425, alt: "Цагаан ED71S цахилгаан ачааны машин", position: "50% 0%" } }, "ed71s")
];

export const pollChoices = ["Асуудалгүй", "Мэдэхгүй", "Муу байх"];

export const galleryImages = ["/assets/gallery-1.png", "/assets/gallery-2.png", "/assets/gallery-3.png"];

export const testDriveModels = ["EC75", "R5", "C5", "C3", "ED71S"];
