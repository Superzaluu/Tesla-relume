"use client";
import { createContext, useCallback, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { pick, type Fact, type Img, type V, type Variant } from "@/data/types";

// Cargo / passenger switch for EC75 and R5. #cargo and #passenger in the URL
// pick the variant; other anchors (#specs, #test-drive) leave it alone.

const VARIANTS: Variant[] = ["cargo", "passenger"];
const VariantContext = createContext<{ variant: Variant; setVariant: (v: Variant) => void }>({ variant: "cargo", setVariant: () => {} });

export function VariantProvider({ children, preload }: { children: ReactNode; preload?: string[] }) {
  const [variant, setState] = useState<Variant>("cargo");

  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.slice(1) as Variant;
      if (VARIANTS.includes(hash)) setState(hash);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    // Preload the other hero photo so switching is instant.
    preload?.forEach((src) => { new Image().src = src; });
    return () => window.removeEventListener("hashchange", fromHash);
  }, [preload]);

  const setVariant = useCallback((v: Variant) => {
    setState(v);
    window.history.replaceState(null, "", `#${v}`);
  }, []);

  return <VariantContext.Provider value={{ variant, setVariant }}>{children}</VariantContext.Provider>;
}

export const useVariant = () => useContext(VariantContext).variant;

export function VariantToggle({ onPhoto = false }: { onPhoto?: boolean }) {
  const { variant, setVariant } = useContext(VariantContext);
  return (
    <div className={`variant-toggle${onPhoto ? " variant-toggle--on-photo" : ""}`} role="group" aria-label="Хувилбар сонгох">
      {([["cargo", "Ачааны"], ["passenger", "Зорчигчийн"]] as const).map(([value, label]) => (
        <button key={value} type="button" className={`variant-toggle__btn${variant === value ? " is-active" : ""}`} aria-pressed={variant === value} onClick={() => setVariant(value)}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** Text that changes with the variant. */
export function VariantText({ value }: { value: V<string> }) {
  return <>{pick(value, useVariant())}</>;
}

/** Image whose src/alt change with the variant. */
export function VariantImg({ image, className, loading, fetchPriority }: { image: Img; className?: string; loading?: "lazy"; fetchPriority?: "high" }) {
  const variant = useVariant();
  return <img className={className} src={pick(image.src, variant)} width={image.width} height={image.height} alt={pick(image.alt, variant)} loading={loading} fetchPriority={fetchPriority} />;
}

export function VariantFacts({ facts }: { facts: V<Fact[]> }) {
  const list = pick(facts, useVariant());
  return (
    <dl className="mfeature__facts">
      {list.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
    </dl>
  );
}

/** Model hero <section>; its stacked-layout background colour follows the variant. */
export function VariantSection({ sky, className, children }: { sky: V<string>; className: string; children: ReactNode }) {
  const color = pick(sky, useVariant());
  return <section className={className} style={{ "--color-hero-sky": color } as CSSProperties}>{children}</section>;
}
