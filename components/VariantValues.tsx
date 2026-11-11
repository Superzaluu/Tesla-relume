import { isByVariant, type Fact, type Img, type V } from "@/data/types";
import { VariantFacts, VariantImg, VariantText } from "./Variant";

// Server-side helpers: plain values render as static HTML, and only values
// that differ per variant become small client components.

export function T({ v }: { v: V<string> }) {
  return isByVariant(v) ? <VariantText value={v} /> : <>{v}</>;
}

export function Picture({ image, className, eager }: { image: Img; className?: string; eager?: boolean }) {
  const loading = eager ? undefined : "lazy";
  const fetchPriority = eager ? "high" : undefined;
  if (isByVariant(image.src) || isByVariant(image.alt)) return <VariantImg image={image} className={className} loading={loading} fetchPriority={fetchPriority} />;
  return <img className={className} src={image.src as string} width={image.width} height={image.height} alt={image.alt as string} loading={loading} fetchPriority={fetchPriority} />;
}

export function Facts({ facts }: { facts: V<Fact[]> }) {
  if (isByVariant(facts)) return <VariantFacts facts={facts} />;
  return (
    <dl className="mfeature__facts">
      {facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
    </dl>
  );
}
