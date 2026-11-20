"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Magnetic button (user, 2026-11-20: «Хэмнэлтийн тооцоолуур»). When the mouse comes within `radius` px of the
 * button's edge it leans toward the pointer (`strength` of the distance, at most `max` px, weaker farther out)
 * and springs back when the mouse leaves. Listens on the surrounding section, so the pull starts before the mouse reaches the button
 * without an invisible hit area covering its neighbours. Mouse only; off with reduced motion.
 */
/** `zone`: where the mouse is tracked — the surrounding section, or the whole window (a fixed, floating button). */
export function Magnetic({ children, radius = 90, strength = 0.35, max = 14, zone: area = "section" }: {
  children: ReactNode; radius?: number; strength?: number; max?: number; zone?: "section" | "window";
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const zone: HTMLElement | Window = area === "window" ? window : el.closest("section") ?? el.parentElement ?? document.body;
    let frame = 0;

    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        // Distance from the pointer to the button's edge (0 inside it).
        const outX = Math.max(box.left - event.clientX, 0, event.clientX - box.right);
        const outY = Math.max(box.top - event.clientY, 0, event.clientY - box.bottom);
        const gap = Math.hypot(outX, outY);
        if (gap > radius) { el.style.transform = ""; el.classList.remove("is-pulled"); return; }
        // Pull toward the pointer, capped at `max` px and weaker the farther the pointer is from the edge.
        const near = 1 - gap / radius;
        const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
        const dx = clamp((event.clientX - (box.left + box.width / 2)) * strength, max) * near;
        const dy = clamp((event.clientY - (box.top + box.height / 2)) * strength, max * 0.7) * near;
        el.classList.add("is-pulled");
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
    };
    const leave = () => { cancelAnimationFrame(frame); el.style.transform = ""; el.classList.remove("is-pulled"); };

    const leaveEvent = area === "window" ? "blur" : "pointerleave";
    zone.addEventListener("pointermove", move as EventListener);
    zone.addEventListener(leaveEvent, leave);
    return () => {
      cancelAnimationFrame(frame);
      zone.removeEventListener("pointermove", move as EventListener);
      zone.removeEventListener(leaveEvent, leave);
    };
  }, [radius, strength, max, area]);

  return <span ref={ref} className="magnetic">{children}</span>;
}
