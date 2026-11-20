"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSavingsData } from "@/components/forms/SavingsCalculator";
import type { CalcModel } from "@/data/savings";
import { SavingsPanel } from "@/components/home/SavingsTeaser";
import { Magnetic } from "@/components/ui/Magnetic";

/** «Хэмнэлтийн тооцоолуур» button; opens the quick fuel-cost window. Same look as the calculator's own trigger. */
function QuickTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="btn btn--secondary saving-calculator__trigger" aria-haspopup="dialog" onClick={onOpen}>
      Хэмнэлтийн тооцоолуур
    </button>
  );
}

/**
 * The homepage fuel-cost section as a window (user, 2026-11-20), for the page's own model only. Its
 * "Дэлгэрэнгүй тооцоолох" closes it and opens the full calculator. Esc, the backdrop and × close it.
 */
function SavingsQuick({ calc, onClose }: { calc?: CalcModel; onClose: () => void }) {
  const data = useSavingsData();
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    document.body.classList.add("savings-modal-open");
    dialog.current?.querySelector<HTMLElement>("button[aria-pressed='true'], input")?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("savings-modal-open");
      back?.focus();
    };
  }, [onClose]);
  if (!data) return null;
  return (
    <div className="savings-modal">
      <div className="savings-modal__backdrop" onClick={onClose} />
      <section ref={dialog} className="savings-modal__dialog savings-modal__dialog--quick tw" role="dialog" aria-modal="true" aria-labelledby="quick-savings-title">
        <button className="savings-modal__close" type="button" aria-label="Хаах" onClick={onClose}>
          <img src="/assets/close.svg" width={20} height={20} alt="" />
        </button>
        <SavingsPanel models={data.models} fuelPrices={data.fuelPrices} idPrefix="quick-savings" own={calc} onDetail={onClose} />
      </section>
    </div>
  );
}

/** Set once the visitor has opened the calculator, so the floating button stays away for the session. */
const SEEN = "savings-calculator-opened";

/**
 * «Хэмнэлтийн тооцоолуур» under the hero (user, 2026-11-20). When the visitor scrolls past it, a copy appears
 * and follows the mouse at a middle distance (bottom-right corner on touch screens) until it is clicked;
 * clicking either opens the quick fuel-cost window and stops the following for the rest of the session.
 * The one in the bar is magnetic.
 */
export function FloatingSavings({ calc }: { calc?: CalcModel }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [away, setAway] = useState(false);
  const [opened, setOpened] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try { if (sessionStorage.getItem(SEEN)) setOpened(true); } catch { /* storage blocked: keep following */ }
  }, []);

  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    // Away = the button has gone up under the sticky bars (~120px), not merely below the fold.
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setAway(el.getBoundingClientRect().bottom < 120));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const [quick, setQuick] = useState(false);
  const closeQuick = useCallback(() => setQuick(false), []);
  const open = () => {
    setOpened(true);
    setQuick(true);
    try { sessionStorage.setItem(SEEN, "1"); } catch { /* storage blocked: hide for this page view only */ }
  };
  const floating = away && !opened;

  // The last mouse position, known before the button appears so it starts next to the pointer.
  const pointer = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const track = (event: PointerEvent) => { if (event.pointerType === "mouse") pointer.current = { x: event.clientX, y: event.clientY }; };
    window.addEventListener("pointermove", track, { passive: true });
    return () => window.removeEventListener("pointermove", track);
  }, []);

  // Mouse: the floating button follows the pointer at a middle distance (user, 2026-11-20: "not close, not
  // far"), below-right of it, flipping sides near the window edges, with a soft lag. When the pointer heads
  // for the button it stops and waits, so it can be caught and clicked; it follows again once the pointer
  // has moved well away. Touch screens and reduced motion keep it in the bottom-right corner.
  const float = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = float.current;
    if (!floating || !box) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const GAP = 56, EDGE = 12, CATCH = 44, RELEASE = 170, EASE = 0.12;
    const size = () => ({ w: box.offsetWidth, h: box.offsetHeight });
    const target = (p: { x: number; y: number }) => {
      const { w, h } = size();
      let x = p.x + GAP, y = p.y + GAP;
      if (x + w > window.innerWidth - EDGE) x = p.x - GAP - w;
      if (y + h > window.innerHeight - EDGE) y = p.y - GAP - h;
      return {
        x: Math.min(Math.max(x, EDGE), window.innerWidth - w - EDGE),
        y: Math.min(Math.max(y, EDGE), window.innerHeight - h - EDGE)
      };
    };
    const start = pointer.current ? target(pointer.current) : { x: window.innerWidth - size().w - 20, y: window.innerHeight - size().h - 20 };
    let { x, y } = start;
    let waiting = false;
    let frame = 0;
    // Heading for the button = the mouse moves toward its centre (within ~60°). Judged from the mouse's own
    // movement, not the distance, which also shrinks while the lagging button catches up.
    let last: { x: number; y: number } | null = pointer.current;
    const heading = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const p = { x: event.clientX, y: event.clientY };
      if (last) {
        const vx = p.x - last.x, vy = p.y - last.y, speed = Math.hypot(vx, vy);
        const { w, h } = size();
        const cx = x + w / 2 - p.x, cy = y + h / 2 - p.y, far = Math.hypot(cx, cy);
        if (speed > 1.5 && far > 0 && (vx * cx + vy * cy) / (speed * far) > 0.5 && far < RELEASE + w / 2) waiting = true;
      }
      last = p;
    };
    window.addEventListener("pointermove", heading, { passive: true });
    box.classList.add("is-following");
    const tick = () => {
      const p = pointer.current;
      if (p) {
        const { w, h } = size();
        // Distance from the pointer to the button's edge (0 when over it).
        const gap = Math.hypot(Math.max(x - p.x, 0, p.x - (x + w)), Math.max(y - p.y, 0, p.y - (y + h)));
        if (gap < CATCH) waiting = true;
        else if (gap > RELEASE) waiting = false;
        if (!waiting) {
          const t = target(p);
          x += (t.x - x) * EASE;
          y += (t.y - y) * EASE;
        }
      }
      box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", heading);
      box.classList.remove("is-following");
      box.style.transform = "";
    };
  }, [floating]);

  return (
    <>
      <span ref={anchor} className="savings-anchor">
        <Magnetic><QuickTrigger onOpen={open} /></Magnetic>
      </span>
      {/* In <body>, so no transformed or filtered ancestor can turn `position: fixed` into a local box. */}
      {mounted && createPortal(
        <>
          <div ref={float} className={`savings-float${floating ? " is-shown" : ""}`} aria-hidden={!floating} inert={!floating}>
            <QuickTrigger onOpen={open} />
          </div>
          {quick && <SavingsQuick calc={calc} onClose={closeQuick} />}
        </>,
        document.body
      )}
    </>
  );
}
