"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { HeroSlide as SlideData } from "@/data/home";
import { HeroSlide } from "@/components/hero/HeroSlide";
import { useSiteChrome } from "@/components/layout/SiteChrome";

const DELAY = 7000;
const STACKED = "(max-width: 991px), (max-aspect-ratio: 6/5)";

// Full-screen model carousel: arrows, dots, swipe, keyboard, autoplay
// (paused on hover/focus and for reduced motion), #hero-<model> deep links.
export function HeroCarousel({ slides }: { slides: SlideData[] }) {
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

  // With one slide per model there are ~20 large photos: only load the current
  // slide and its neighbours, and keep anything already shown.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1, count - 1]));
  useEffect(() => {
    setLoaded((prev) => {
      const wanted = [index - 1, index, index + 1].map((i) => (i + count) % count);
      if (wanted.every((i) => prev.has(i))) return prev;
      return new Set([...prev, ...wanted]);
    });
  }, [index, count]);

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
      // A #hero-<model> link makes the browser scroll the carousel sideways to that
      // slide's id on top of our own translateX; keep the section unscrolled.
      onScroll={(e) => { if (e.currentTarget.scrollLeft) e.currentTarget.scrollLeft = 0; }}
      ref={(node) => { if (node && node.scrollLeft) node.scrollLeft = 0; }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(index + 1); else if (e.key === "ArrowLeft") go(index - 1); }}
    >
      <div
        className={`hero-carousel__track${drag ? " is-dragging" : ""}`} ref={trackRef} style={trackStyle}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={endDrag}
        onClickCapture={(e) => { if (Math.abs(dragDelta.current) > 8) { e.preventDefault(); dragDelta.current = 0; } }}
      >
        {slides.map((s, i) => (
          <HeroSlide key={s.id} slide={s} position={i} total={count} active={i === index} showImage={loaded.has(i)} />
        ))}
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
