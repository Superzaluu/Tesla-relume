"use client";

import { useEffect } from "react";

/**
 * Entrance motion (variant A, user, 2026-11-20): cards, pictures and blocks below the fold rise 16px and fade in
 * as they scroll into view, 70ms apart within one row. Only elements still below the fold get hidden, and only
 * once this script runs, so the page is complete without it; reduced-motion visitors see everything at rest.
 */
const TARGETS = [
  ".mcard", ".mgroup", ".mequip__group", ".msimilar__list > li", ".mfeature", ".mwide", ".mcolumn",
  ".mpick__trim", ".mwinter__media", ".msmart__pills", ".section-title"
].join(",");

export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;
    const fold = window.innerHeight * 0.92;
    const done = (event: TransitionEvent) => {
      const el = event.currentTarget as HTMLElement;
      if (event.target !== el || event.propertyName !== "opacity") return;
      // Hand the element back to its own hover transitions (no stagger delay left behind).
      el.classList.remove("rv", "rv-in");
      el.style.removeProperty("--rv-i");
      el.removeEventListener("transitionend", done);
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.addEventListener("transitionend", done);
        el.classList.add("rv-in");
        observer.unobserve(el);
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    main.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
      // Nested targets (a card inside a feature) reveal with their parent only.
      if (el.parentElement?.closest(TARGETS)) return;
      if (el.getBoundingClientRect().top < fold) return;
      const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--rv-i", String(Math.min(Math.max(index, 0), 5)));
      el.classList.add("rv");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return null;
}
