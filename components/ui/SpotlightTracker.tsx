"use client";

import { useEffect } from "react";

/**
 * Spotlight hover for every `.spotlight` element on the page: while the mouse moves over one, the
 * pointer position is written as --spot-x / --spot-y on the element itself and on each of its direct
 * children, in their own coordinates. CSS (model.css, "Spotlight hover") draws the light from those.
 * One document listener, throttled to one update per frame; touch and pen input are ignored.
 */
export function SpotlightTracker() {
  useEffect(() => {
    let frame = 0;
    let last: PointerEvent | null = null;

    const place = (element: HTMLElement, x: number, y: number) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--spot-x", `${x - rect.left}px`);
      element.style.setProperty("--spot-y", `${y - rect.top}px`);
    };

    const update = () => {
      frame = 0;
      const event = last;
      if (!event || !(event.target instanceof Element)) return;
      const host = event.target.closest<HTMLElement>(".spotlight");
      if (!host) return;
      place(host, event.clientX, event.clientY);
      for (const child of Array.from(host.children) as HTMLElement[]) place(child, event.clientX, event.clientY);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      last = event;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
