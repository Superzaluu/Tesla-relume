import Link from "next/link";
import type { CSSProperties } from "react";
import type { HeroSlide as Slide } from "@/data/home";
import { SavingsTrigger } from "@/components/forms/SavingsCalculator";

type Props = {
  slide: Slide;
  /** Position in the carousel (0-based) and total, for the "1 / 20: EC75" label. */
  position: number;
  total: number;
  active: boolean;
  /** Render the background photo; the carousel only loads current and neighbouring slides. */
  showImage: boolean;
};

/** One model slide: copy, actions and background photo. */
// Scene photos (2026-11-15): 2560×1140 composites, the vehicle centred in the lower half and empty sky above
// for the copy. They get their own crop rules (.hero--scene in site.css) so the vehicle is never cut off.
const SCENE_RATIO = 2560 / 1140;

export function HeroSlide({ slide, position, total, active, showImage }: Props) {
  const first = position === 0;
  const Heading = first ? "h1" : "h2";
  const scene = Math.abs(slide.image.width / slide.image.height - SCENE_RATIO) < 0.02;
  return (
    <div
      id={slide.id} className={`hero hero__slide${scene ? " hero--scene" : ""}`} data-theme={slide.theme} data-theme-sm={slide.themeSm}
      style={{ "--color-hero-sky": slide.sky } as CSSProperties}
      role="group" aria-roledescription="slide" aria-label={`${position + 1} / ${total}: ${slide.model}`}
      aria-hidden={!active} inert={!active}
    >
      <div className="hero__content">
        {/* No category line above the name: the photo already shows the body type (user, 2026-11-15). */}
        <Heading className="hero__model">{slide.model}</Heading>
        <p className="hero__subtitle">{slide.subtitle}</p>
        {slide.messages && (
          <div className="hero__rotating-message" aria-live="polite">
            {slide.messages.map((message) => <p key={message}>{message}</p>)}
          </div>
        )}
        <div className="actions hero__actions">
          <Link className="btn btn--light btn--wide" href={slide.href}>Дэлгэрэнгүй</Link>
          <SavingsTrigger model={slide.id.replace(/^hero-/, "")} />
        </div>
      </div>
      {showImage && (
        <img
          className="hero__bg" src={slide.image.src} width={slide.image.width} height={slide.image.height} alt={slide.image.alt}
          style={slide.image.position ? { objectPosition: slide.image.position } : undefined}
          fetchPriority={first ? "high" : undefined} decoding={first ? undefined : "async"}
        />
      )}
      {/* The key facts (range first) are in the benefit strip under the carousel and on the model cards (2026-11-15). */}
    </div>
  );
}
