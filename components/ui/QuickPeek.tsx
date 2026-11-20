"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Peek } from "@/data/types";

/**
 * A hero icon with a photo preview of its section (user, 2026-11-20: variant B «Урьдчилан харах»).
 * Mouse: the card shows on hover and a click goes to the section. Touch: the first tap shows the
 * card, a second tap (on the icon or the card) goes. Keyboard: focus shows it, Enter goes, Esc closes.
 */
export function QuickPeek({ peek, align, className, children }: { peek: Peek; align: "start" | "center" | "end"; className: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  // Read at pointerdown, before focus opens the card, so the first tap on touch only opens it.
  const tap = useRef({ touch: false, wasOpen: false });

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={`${className} has-peek${open ? " is-open" : ""}`}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setOpen(false); }}
      onFocus={() => setOpen(true)}
      onBlur={(event) => { if (!ref.current?.contains(event.relatedTarget as Node)) setOpen(false); }}
    >
      <a
        className="hero__quick-link"
        href={peek.href}
        onPointerDown={(event) => { tap.current = { touch: event.pointerType !== "mouse", wasOpen: open }; }}
        onClick={(event) => {
          if (tap.current.touch && !tap.current.wasOpen) {
            event.preventDefault();
            setOpen(true);
            return;
          }
          setOpen(false);
        }}
      >
        {children}
      </a>
      <a className={`quick-peek quick-peek--${align}`} href={peek.href} tabIndex={-1} aria-hidden={!open} onClick={() => setOpen(false)}>
        <img src={peek.src} alt="" width={1200} height={720} loading="lazy" />
        <span className="quick-peek__text">
          <strong>{peek.title}</strong>
          {peek.text && <span>{peek.text}</span>}
          <em>Дэлгэрэнгүй ↓</em>
        </span>
      </a>
    </span>
  );
}
