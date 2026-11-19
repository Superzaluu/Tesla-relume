/**
 * Points for the small hover glints on the homepage hero vehicles: headlight, rims, glass, logo.
 * x / y are percent of the FULL photo (2560×1140 scene photos), read off a grid over each photo on
 * 2026-11-17. A replaced photo needs its points read again (and a new silhouette mask, see CarShine).
 * Keyed like the mask: "hero/winter/<file name>".
 */
export type GlintPart = "light" | "wheel" | "glass" | "logo";
export type Glint = { part: GlintPart; x: number; y: number };

/**
 * Areas a light band sweeps across on hover: the model-name plate ("EC75 Pro", "C5", green "ED71S")
 * and the front emblem. badge: x / y = top-left corner, w / h = size, all in % of the full photo.
 * emblem: x / y = centre, w = diameter in % of the photo width (drawn as a circle).
 */
export type Sheen = { part: "badge" | "emblem"; x: number; y: number; w: number; h?: number };

export const CAR_SHEENS: Record<string, Sheen[]> = {
  "hero/winter/ec75pro": [
    { part: "badge", x: 31.2, y: 71.3, w: 2.85, h: 2.95 },
    { part: "emblem", x: 32.63, y: 66.65, w: 0.75 }
  ],
  "hero/winter/r5pro": [
    { part: "badge", x: 65.6, y: 74.1, w: 2.8, h: 3.0 },
    { part: "emblem", x: 66.4, y: 67.0, w: 0.9 }
  ],
  "hero/winter/c5": [
    { part: "badge", x: 29.1, y: 71.3, w: 2.7, h: 3.1 },
    { part: "emblem", x: 30.67, y: 67.1, w: 0.7 }
  ],
  "hero/winter/c3": [
    { part: "badge", x: 32.2, y: 73.1, w: 3.05, h: 3.1 },
    { part: "emblem", x: 33.8, y: 69.0, w: 1.6 }
  ],
  "hero/winter/ed71s": [
    { part: "badge", x: 33.52, y: 73.3, w: 3.4, h: 2.3 },
    { part: "emblem", x: 35.25, y: 68.6, w: 1.6 }
  ]
};

export const CAR_GLINTS: Record<string, Glint[]> = {
  "hero/winter/ec75pro": [
    { part: "light", x: 38.0, y: 65.9 },
    { part: "glass", x: 42.0, y: 54.0 },
    { part: "wheel", x: 42.8, y: 79.5 },
    { part: "logo", x: 32.63, y: 66.65 },
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
    { part: "logo", x: 30.67, y: 67.1 },
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
    { part: "logo", x: 35.25, y: 68.6 },
    { part: "glass", x: 48.7, y: 56.1 },
    { part: "wheel", x: 62.6, y: 77.6 }
  ]
};
