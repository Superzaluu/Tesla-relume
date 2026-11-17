"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Vehicle silhouette for a photo, if one was made: /assets/hero/winter/ec75pro.jpg →
 * /assets/hero/winter/shine/ec75pro.png. The PNGs are white with the vehicle as alpha, cut out of each
 * photo by AI background removal (2026-11-17; same size ratio as the photo). Other photos get no shine.
 */
export function shineMask(src: string): string | null {
  const match = /^\/assets\/(hero\/winter|thumbs)\/([\w-]+)\.jpg$/.exec(src);
  return match ? `/assets/${match[1]}/shine/${match[2]}.png` : null;
}

/**
 * Light that plays on the vehicle only, not on the background: a layer masked by the vehicle silhouette,
 * placed right after the photo's <img>. Inside a `.spotlight` parent the light follows the mouse
 * (SpotlightTracker) and a glint sweeps across the body when the pointer comes in. Look: site.css,
 * "Car shine".
 *
 * `followImage`: copy the photo's box, object-position and transform onto the layer (hero photos, whose
 * position and crop change with the screen). Without it the layer just fills its parent like the photo.
 */
export function CarShine({ mask, followImage = false, className = "" }: { mask: string; followImage?: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const shine = ref.current;
    const image = shine?.previousElementSibling;
    if (!followImage || !shine || !(image instanceof HTMLImageElement)) return;
    const sync = () => {
      const style = getComputedStyle(image);
      shine.style.inset = "auto";
      shine.style.left = `${image.offsetLeft}px`;
      shine.style.top = `${image.offsetTop}px`;
      shine.style.width = `${image.offsetWidth}px`;
      shine.style.height = `${image.offsetHeight}px`;
      shine.style.transform = style.transform === "none" ? "" : style.transform;
      shine.style.transformOrigin = style.transformOrigin;
      shine.style.setProperty("--car-mask-pos", style.objectPosition);
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

  return <span ref={ref} className={`car-shine ${className}`} style={{ "--car-mask": `url("${mask}")` } as CSSProperties} aria-hidden="true" />;
}
