"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// Horizontal scroll track; the arrow buttons move it by one item.
export function Slider({ children, className = "", dots }: { children: ReactNode; className?: string; dots?: { src: string; width: number } }) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 0);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const step = () => {
    const el = track.current;
    const item = el?.firstElementChild;
    if (!el || !item) return el?.clientWidth ?? 0;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  };

  return (
    <div className={`slider ${className}`.trim()}>
      <div className="slider__track" ref={track} onScroll={update}>{children}</div>
      <div className="slider__controls">
        {dots ? <img src={dots.src} width={dots.width} height={8} alt="" /> : <span />}
        <div className="slider__buttons">
          <button className="slider__arrow" type="button" aria-label="Өмнөх" disabled={atStart} onClick={() => track.current?.scrollBy({ left: -step() })}>
            <img src="/assets/arrow-back.svg" width={24} height={24} alt="" />
          </button>
          <button className="slider__arrow" type="button" aria-label="Дараах" disabled={atEnd} onClick={() => track.current?.scrollBy({ left: step() })}>
            <img src="/assets/arrow-forward.svg" width={24} height={24} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}
