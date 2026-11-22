"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * User test #1 (2026-11-23), item 1: people clicked the hero photo and nothing happened. Now the photo lights up
 * on hover and a click / tap on it shows «Үзүүлэлт харах» (and «Зураг үзэх» when the page has an album); a second
 * click on the photo goes to the specs. The icon strip on the photo keeps its own previews (QuickPeek).
 */
export function HeroPhotoActions({ children, gallery }: { children: ReactNode; gallery: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={ref}
      className={`mintro__photo${open ? " is-open" : ""}`}
      onClick={(event) => {
        // Clicks on the icon strip, its previews or the buttons themselves are theirs.
        if ((event.target as HTMLElement).closest(".hero__quick-specs, .mintro__photo-actions")) return;
        if (open) go("specs");
        else setOpen(true);
      }}
    >
      {children}
      <div className="mintro__photo-actions">
        <button type="button" className="btn btn--primary" onClick={() => go("specs")}>
          Үзүүлэлт харах <span aria-hidden="true">↓</span>
        </button>
        {gallery && <button type="button" className="btn btn--secondary" onClick={() => go("gallery")}>Зураг үзэх</button>}
      </div>
    </div>
  );
}
