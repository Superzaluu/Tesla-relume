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

// Hero slides come from Supabase (table `hero_slides`), see getHeroSlides() in content.ts.

export const pollChoices = ["Асуудалгүй", "Мэдэхгүй", "Муу байх"];

export const galleryImages = ["/assets/gallery-1.png", "/assets/gallery-2.png", "/assets/gallery-3.png"];

export const testDriveModels = ["EC75", "R5", "C5", "C3", "ED71S"];
