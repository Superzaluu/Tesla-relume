"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { HeroSlide } from "@/data/home";
import { QuickSpecs } from "@/components/QuickSpecs";
import { SavingsTrigger } from "@/components/SavingsCalculator";
import { useSiteChrome } from "@/components/SiteChrome";

const DELAY = 7000;
const STACKED = "(max-width: 991px), (max-aspect-ratio: 6/5)";

// Full-screen model carousel: arrows, dots, swipe, keyboard, autoplay
// (paused on hover/focus and for reduced motion), #hero-<model> deep links.
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const { setHeroLight } = useSiteChrome();
  const [index, setIndex] = useState(0);
  const [stacked, setStacked] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [drag, setDrag] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragDelta = useRef(0);

  const count = slides.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  // Initial slide from #hero-* and the stacked-layout media query.
  useEffect(() => {
    const fromHash = () => slides.findIndex((s) => s.id === window.location.hash.slice(1));
    const initial = fromHash();
    if (initial !== -1) setIndex(initial);
    requestAnimationFrame(() => setAnimate(true)); // no slide-in animation on first paint

    const media = window.matchMedia(STACKED);
    const onMedia = () => setStacked(media.matches);
    onMedia();
    media.addEventListener("change", onMedia);
    const onHash = () => { const i = fromHash(); if (i !== -1) { setIndex(i); window.scrollTo(0, 0); } };
    window.addEventListener("hashchange", onHash);
    return () => { media.removeEventListener("change", onMedia); window.removeEventListener("hashchange", onHash); };
  }, [slides]);

  // Light slides switch the navbar and carousel controls to dark.
  const slide = slides[index];
  const light = ((stacked && slide.themeSm) || slide.theme) === "light";
  useEffect(() => { setHeroLight(light); }, [light, setHeroLight]);
  useEffect(() => () => setHeroLight(false), [setHeroLight]);

  // Autoplay.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), DELAY);
    const onVisibility = () => { if (document.hidden) clearInterval(timer); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisibility); };
  }, [paused, count, index]);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStart.current = e.clientX;
    dragDelta.current = 0;
  };
  const onPointerMove = (e: PointerEvent) => {
    if (dragStart.current === null) return;
    dragDelta.current = e.clientX - dragStart.current;
    if (Math.abs(dragDelta.current) > 8) setDrag(dragDelta.current);
  };
  const endDrag = () => {
    if (dragStart.current === null) return;
    const delta = dragDelta.current;
    dragStart.current = null;
    setDrag(0);
    if (delta < -50) go(index + 1); else if (delta > 50) go(index - 1);
  };

  const trackStyle: CSSProperties = {
    transform: drag ? `translateX(calc(${-index * 100}% + ${drag}px))` : `translateX(${-index * 100}%)`,
    transition: animate ? undefined : "none"
  };

  return (
    <section
      className={`hero-carousel${light ? " is-light" : ""}`} aria-roledescription="carousel" aria-label="Ruichi загварууд"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(index + 1); else if (e.key === "ArrowLeft") go(index - 1); }}
    >
      <div
        className={`hero-carousel__track${drag ? " is-dragging" : ""}`} ref={trackRef} style={trackStyle}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={endDrag}
        onClickCapture={(e) => { if (Math.abs(dragDelta.current) > 8) { e.preventDefault(); dragDelta.current = 0; } }}
      >
        {slides.map((s, i) => {
          const active = i === index;
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div
              key={s.id} id={s.id} className="hero hero__slide" data-theme={s.theme} data-theme-sm={s.themeSm}
              style={{ "--color-hero-sky": s.sky } as CSSProperties}
              role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${count}: ${s.model}`}
              aria-hidden={!active} inert={!active}
            >
              <div className="hero__content">
                <p className="hero__eyebrow">{s.eyebrow}</p>
                <Heading className="hero__model">{s.model}</Heading>
                <p className="hero__subtitle">{s.subtitle}</p>
                {s.messages && (
                  <div className="hero__rotating-message" aria-live="polite">
                    {s.messages.map((message) => <p key={message}>{message}</p>)}
                  </div>
                )}
                <div className="actions hero__actions">
                  <a className="btn btn--primary btn--wide" href="#test-drive">Ногоон зээл</a>
                  <Link className="btn btn--light btn--wide" href={s.href}>Дэлгэрэнгүй</Link>
                  <SavingsTrigger />
                </div>
              </div>
              <img
                className="hero__bg" src={s.image.src} width={s.image.width} height={s.image.height} alt={s.image.alt}
                style={s.image.position ? { objectPosition: s.image.position } : undefined}
                fetchPriority={i === 0 ? "high" : undefined} decoding={i === 0 ? undefined : "async"}
              />
              {s.quick && <QuickSpecs specs={s.quick} />}
            </div>
          );
        })}
      </div>

      <button className="hero-carousel__arrow hero-carousel__arrow--prev" type="button" aria-label="Өмнөх загвар" onClick={() => go(index - 1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button className="hero-carousel__arrow hero-carousel__arrow--next" type="button" aria-label="Дараагийн загвар" onClick={() => go(index + 1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="hero-carousel__dots" role="tablist" aria-label="Загвар сонгох">
        {slides.map((s, i) => (
          <button key={s.id} type="button" className="hero-carousel__dot" role="tab" aria-selected={i === index} aria-label={`Слайд ${i + 1} / ${count}`} onClick={() => go(i)} />
        ))}
      </div>
    </section>
  );
}
