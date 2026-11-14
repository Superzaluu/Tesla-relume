import { QuickIcon } from "@/components/ui/QuickSpecs";

// Line icons for the short spec / equipment lists. Keys shared with the hero icon strip use the
// same images (QuickIcon); the rest are drawn here in the same thin-stroke style.
const QUICK: Record<string, string> = {
  range: "range", charging: "charging", motor: "motor", payload: "payload", dimension: "dimension", seats: "seats",
  rwd: "rwd", fwd: "fwd", awd: "awd", fuel: "fuel", cargo: "flatbed"
};

const PATHS: Record<string, string> = {
  battery: "M3 8.5A1.5 1.5 0 0 1 4.5 7h13A1.5 1.5 0 0 1 19 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 15.5zM21 10.5v3M7 10v4M10.5 10v4",
  shield: "M12 3l7 3v5c0 4.6-3 8.5-7 10-4-1.5-7-5.4-7-10V6zM9 12l2 2 4-4",
  camera: "M4.5 7.5h3L9 5h6l1.5 2.5h3A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V9a1.5 1.5 0 0 1 1.5-1.5zM12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  camera360: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z",
  steer: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3.5 10.5h6M14.5 10.5h6M12 14.5V21",
  brake: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5v6M12 16.5v.01",
  cruise: "M4 17a8 8 0 1 1 16 0M12 17l3.5-5M4 17h2.5M17.5 17H20M12 9V7.5",
  tire: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 3v5M12 16v5M3 12h5M16 12h5",
  plug: "M9 3v5M15 3v5M7 8h10v3.5a5 5 0 0 1-10 0zM12 16.5V21",
  snow: "M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 6l2.5-1.5M9.5 19.5L12 18l2.5 1.5",
  bluetooth: "M7 7.5l10 9-5 4.5V3l5 4.5-10 9",
  phone: "M8.5 2.5h7A1.5 1.5 0 0 1 17 4v16a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20V4a1.5 1.5 0 0 1 1.5-1.5zM11 18.5h2",
  cloud: "M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9.5zM12 11v5.5M9.8 13.2L12 11l2.2 2.2",
  heat: "M8 3.5c-1.8 2.2 1.8 3.8 0 6.5M12 3.5c-1.8 2.2 1.8 3.8 0 6.5M16 3.5c-1.8 2.2 1.8 3.8 0 6.5M4 14h16v4.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5z",
  regen: "M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4M12.5 8l-2.5 4.5h4L11.5 17",
  lane: "M6 21L9.5 3M18 21L14.5 3M12 5.5v2.5M12 11v2.5M12 16.5V19",
  eye: "M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
};

export function SpecIcon({ icon, off = false }: { icon: string; off?: boolean }) {
  const quick = QUICK[icon];
  return (
    <span className={`mkey__icon${off ? " is-off" : ""}`} aria-hidden="true">
      {quick ? (
        <QuickIcon icon={quick} className="mkey__quick" />
      ) : (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={PATHS[icon] ?? PATHS.shield} />
          {off && <path d="M3 3l18 18" />}
        </svg>
      )}
    </span>
  );
}
