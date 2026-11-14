import Link from "next/link";
import type { CSSProperties } from "react";
import type { HeroSlide as Slide } from "@/data/home";
import { QuickSpecs } from "@/components/ui/QuickSpecs";
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

/** One full-screen model slide: copy, actions, background photo and quick-spec icons. */
export function HeroSlide({ slide, position, total, active, showImage }: Props) {
  const first = position === 0;
  const Heading = first ? "h1" : "h2";
  return (
    <div
      id={slide.id} className="hero hero__slide" data-theme={slide.theme} data-theme-sm={slide.themeSm}
      style={{ "--color-hero-sky": slide.sky } as CSSProperties}
      role="group" aria-roledescription="slide" aria-label={`${position + 1} / ${total}: ${slide.model}`}
      aria-hidden={!active} inert={!active}
    >
      <div className="hero__content">
        <p className="hero__eyebrow">{slide.eyebrow}</p>
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
      {slide.quick && <QuickSpecs specs={slide.quick} />}
    </div>
  );
}
