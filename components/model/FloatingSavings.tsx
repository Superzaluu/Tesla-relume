"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { CalcModel } from "@/data/savings";
import { Magnetic } from "@/components/ui/Magnetic";

/** /savings/ on this page's model (user test #1, 2026-11-23, item 6: the calculator is its own page now). */
export const savingsHref = (calc?: CalcModel) => {
  if (!calc) return "/savings/";
  const [slug, variant] = calc.value.split("|");
  return `/savings/?model=${encodeURIComponent(slug)}${variant ? `&variant=${variant}` : ""}`;
};

/**
 * «Хэмнэлтийн тооцоолуур» button. User test #1, item 3: the outlined text button was not read as a button and
 * nobody clicked it for a long time, so it now has a coin icon, a filled tint, a raised shadow and a "₮" badge
 * that pulses (ux-test.css «.savings-cta»).
 */
function QuickTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="btn savings-cta" onClick={onOpen}>
      <span className="savings-cta__icon" aria-hidden="true">₮</span>
      <span>Хэмнэлтийн тооцоолуур</span>
      <span className="savings-cta__arrow" aria-hidden="true">→</span>
    </button>
  );
}

/** Set once the visitor has opened the calculator, so the floating button stays away for the session. */
const SEEN = "savings-calculator-opened";

/**
 * «Хэмнэлтийн тооцоолуур» in the sticky model menu, between "Урьдчилсан захиалга" and "Туршилтын жолоодлого"
 * (user, 2026-11-21; it was under the hero before). At the first mouse movement the button lifts off from that
 * place and follows the mouse at a middle distance until it is clicked.
 * Clicking either opens /savings/ on this model and stops the following for the rest of the session.
 * Phones have no room in the menu: there it waits in the bottom-right corner instead. The one in the menu is magnetic.
 */
export function FloatingSavings({ calc }: { calc?: CalcModel }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [away, setAway] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [opened, setOpened] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try { if (sessionStorage.getItem(SEEN)) setOpened(true); } catch { /* storage blocked: keep following */ }
    // Same breakpoint as the menu's own buttons (model.css: .mnav__cta / .mnav__savings hidden below 768px).
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // It lifts off at the first real mouse movement (user, 2026-11-21: "тэндээс эхэлж хулгана дагаж хөдөлнө";
    // waiting for the hero to scroll away looked like it did not move at all). Touch screens never send one.
    const start = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setAway(true);
      window.removeEventListener("pointermove", start);
    };
    window.addEventListener("pointermove", start, { passive: true });
    return () => window.removeEventListener("pointermove", start);
  }, []);

  const router = useRouter();
  const open = () => {
    setOpened(true);
    router.push(savingsHref(calc));
    try { sessionStorage.setItem(SEEN, "1"); } catch { /* storage blocked: hide for this page view only */ }
  };
  const floating = (away || narrow) && !opened;

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
  // has moved well away. It follows whenever a real mouse moves, whatever the browser reports about hover,
  // pointer type or reduced motion (user, 2026-11-20: it sat still on a Windows laptop that reports one of
  // those); with no mouse (touch screens) it waits in the bottom-right corner.
  const float = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = float.current;
    if (!floating || !box) return;
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
    // It starts where the menu button is, so it visibly lifts off from there; on phones (no menu button) from
    // the bottom-right corner.
    const slot = anchor.current?.getBoundingClientRect();
    const start = slot && slot.width > 0 ? { x: slot.left, y: slot.top }
      : pointer.current ? target(pointer.current) : { x: window.innerWidth - size().w - 20, y: window.innerHeight - size().h - 20 };
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
      {/* While its copy follows the mouse, the menu button keeps its place but is hidden: it has "left" it. */}
      <span ref={anchor} className={`savings-anchor${floating ? " is-lifted" : ""}`}>
        <Magnetic><QuickTrigger onOpen={open} /></Magnetic>
      </span>
      {/* In <body>, so no transformed or filtered ancestor can turn `position: fixed` into a local box. */}
      {mounted && createPortal(
        <>
          <div ref={float} className={`savings-float${floating ? " is-shown" : ""}`} aria-hidden={!floating} inert={!floating}>
            <QuickTrigger onOpen={open} />
          </div>
        </>,
        document.body
      )}
    </>
  );
}
