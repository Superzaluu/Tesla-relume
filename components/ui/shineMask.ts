// Plain helpers for CarShine. They live outside CarShine.tsx ("use client") because server components
// (ModelSpecCard, ModelFamilyCard) call them while rendering; a function exported from a client module
// can't be called on the server, which broke the Vercel build at /styleguide (2026-11-19).

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
