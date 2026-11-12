import type { ReactNode } from "react";

export function SectionTitle({ tagline, title, text, note, id }: { tagline?: string; title: ReactNode; text?: ReactNode; note?: number; id?: string }) {
  return (
    <div className="section-title section-title--narrow">
      {tagline && <p className="tagline">{tagline}</p>}
      <h2 className="h2" id={id}>{title}</h2>
      {text && <p className="text-medium">{text}{note ? <> <sup>{note}</sup></> : null}</p>}
    </div>
  );
}
