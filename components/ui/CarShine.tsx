"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Glint } from "@/data/carGlints";

/**
 * Vehicle silhouette for a photo, if one was made: /assets/hero/winter/ec75pro.jpg →
 * /assets/hero/winter/shine/ec75pro.png. The PNGs are white with the vehicle as alpha, cut out of each
 * photo by AI background removal (2026-11-17; same size ratio as the photo). Other photos get no shine.
 */
export function shineMask(src: string): string | null {
  const match = /^\/assets\/(hero\/winter|thumbs)\/([\w-]+)\.jpg$/.exec(src);
  return match ? `/assets/${match[1]}/shine/${match[2]}.png` : null;
}

/** Key for CAR_GLINTS: "/assets/hero/winter/c5.jpg" → "hero/winter/c5". */
export const glintKey = (src: string) => /^\/assets\/(hero\/winter\/[\w-]+)\.jpg$/.exec(src)?.[1] ?? null;

/** One object-position value ("85%", "12px", "center") → offset in px for `free` px of crop. */
function offset(value: string | undefined, free: number) {
  if (!value || value === "center") return free / 2;
  if (value === "left" || value === "top") return 0;
  if (value === "right" || value === "bottom") return free;
  return value.endsWith("%") ? (free * parseFloat(value)) / 100 : parseFloat(value) || 0;
}

/**
 * Light that plays on the vehicle only, not on the background: a layer masked by the vehicle silhouette,
 * placed right after the photo's <img>. Inside a `.spotlight` parent the light follows the mouse
 * (SpotlightTracker) and a glint sweeps across the body when the pointer comes in. Look: site.css,
 * "Car shine".
 *
 * `followImage`: copy the photo's box, object-position and transform onto the layer (hero photos, whose
 * position and crop change with the screen). Without it the layer just fills its parent like the photo.
 *
 * `glints`: small star flashes on the headlight, rims, glass and logo (points in % of the full photo).
 * They sit on a "stage" the size of the whole photo as object-fit: cover draws it, so a point stays on
 * its part however the photo is cropped. Needs `followImage`.
 */
export function CarShine({ mask, followImage = false, glints, className = "" }: { mask: string; followImage?: boolean; glints?: Glint[]; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const glintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const shine = ref.current;
    const image = shine?.previousElementSibling;
    if (!followImage || !shine || !(image instanceof HTMLImageElement)) return;
    const sync = () => {
      const style = getComputedStyle(image);
      const box = { left: `${image.offsetLeft}px`, top: `${image.offsetTop}px`, width: `${image.offsetWidth}px`, height: `${image.offsetHeight}px` };
      for (const layer of [shine, glintRef.current]) {
        if (!layer) continue;
        Object.assign(layer.style, { inset: "auto", ...box, transform: style.transform === "none" ? "" : style.transform, transformOrigin: style.transformOrigin });
      }
      shine.style.setProperty("--car-mask-pos", style.objectPosition);

      // Stage = the whole photo as object-fit: cover lays it out inside the image box.
      const stage = glintRef.current?.firstElementChild as HTMLElement | null;
      const { naturalWidth: iw, naturalHeight: ih, offsetWidth: w, offsetHeight: h } = image;
      if (!stage || !iw || !ih) return;
      const scale = Math.max(w / iw, h / ih);
      const sw = iw * scale, sh = ih * scale;
      const [px, py] = style.objectPosition.split(/\s+/);
      Object.assign(stage.style, { left: `${offset(px, w - sw)}px`, top: `${offset(py, h - sh)}px`, width: `${sw}px`, height: `${sh}px` });
      stage.style.setProperty("--stage-w", `${sw}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(image);
    if (image.parentElement) observer.observe(image.parentElement);
    image.addEventListener("load", sync);
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      image.removeEventListener("load", sync);
      window.removeEventListener("resize", sync);
    };
  }, [followImage]);

  return (
    <>
      <span ref={ref} className={`car-shine ${className}`} style={{ "--car-mask": `url("${mask}")` } as CSSProperties} aria-hidden="true" />
      {followImage && glints && glints.length > 0 && (
        <span ref={glintRef} className="car-glints" aria-hidden="true">
          <span className="car-glints__stage">
            {glints.map((glint, i) => (
              <span
                key={i} className={`car-glint car-glint--${glint.part}`}
                style={{ left: `${glint.x}%`, top: `${glint.y}%`, "--i": i } as CSSProperties}
              />
            ))}
          </span>
        </span>
      )}
    </>
  );
}
