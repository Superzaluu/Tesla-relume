/**
 * Points for the small hover glints on the homepage hero vehicles: headlight, rims, glass, logo.
 * x / y are percent of the FULL photo (2560×1140 scene photos), read off a grid over each photo on
 * 2026-11-17. A replaced photo needs its points read again (and a new silhouette mask, see CarShine).
 * Keyed like the mask: "hero/winter/<file name>".
 */
export type GlintPart = "light" | "wheel" | "glass" | "logo";
export type Glint = { part: GlintPart; x: number; y: number };

export const CAR_GLINTS: Record<string, Glint[]> = {
  "hero/winter/ec75pro": [
    { part: "light", x: 38.0, y: 65.9 },
    { part: "glass", x: 42.0, y: 54.0 },
    { part: "wheel", x: 42.8, y: 79.5 },
    { part: "logo", x: 32.5, y: 66.7 },
    { part: "glass", x: 57.5, y: 55.1 },
    { part: "wheel", x: 64.3, y: 77.8 }
  ],
  "hero/winter/r5pro": [
    { part: "light", x: 61.5, y: 67.9 },
    { part: "glass", x: 58.5, y: 54.9 },
    { part: "wheel", x: 54.8, y: 79.7 },
    { part: "logo", x: 66.4, y: 67.0 },
    { part: "glass", x: 42.5, y: 54.9 },
    { part: "wheel", x: 34.6, y: 78.0 }
  ],
  "hero/winter/c5": [
    { part: "light", x: 36.0, y: 65.9 },
    { part: "glass", x: 37.9, y: 55.9 },
    { part: "wheel", x: 41.1, y: 80.2 },
    { part: "logo", x: 30.2, y: 65.4 },
    { part: "glass", x: 52.0, y: 55.2 },
    { part: "wheel", x: 64.2, y: 78.7 }
  ],
  "hero/winter/c3": [
    { part: "light", x: 39.3, y: 67.8 },
    { part: "glass", x: 40.8, y: 57.1 },
    { part: "wheel", x: 43.3, y: 80.2 },
    { part: "logo", x: 33.8, y: 69.0 },
    { part: "glass", x: 48.9, y: 56.0 },
    { part: "wheel", x: 62.6, y: 78.8 }
  ],
  "hero/winter/ed71s": [
    { part: "light", x: 40.8, y: 68.1 },
    { part: "glass", x: 40.8, y: 56.1 },
    { part: "wheel", x: 44.4, y: 80.7 },
    { part: "logo", x: 35.1, y: 68.8 },
    { part: "glass", x: 48.7, y: 56.1 },
    { part: "wheel", x: 62.6, y: 77.6 }
  ]
};
