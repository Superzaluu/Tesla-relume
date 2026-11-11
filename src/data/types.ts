// Shared content types. Anything wrapped in `V<T>` may differ between the
// cargo and passenger versions of a model (EC75, R5) and is resolved by the
// variant toggle on the model page.

export type Variant = "cargo" | "passenger";
export type ByVariant<T> = { cargo: T; passenger: T };
export type V<T> = T | ByVariant<T>;

export const isByVariant = <T,>(value: V<T>): value is ByVariant<T> =>
  typeof value === "object" && value !== null && !Array.isArray(value) && "cargo" in value && "passenger" in value;

export const pick = <T,>(value: V<T>, variant: Variant): T => (isByVariant(value) ? value[variant] : value);

export type Img = { src: V<string>; width: number; height: number; alt: V<string> };

export type CategoryId = "passenger" | "cargo-van" | "flatbed" | "box" | "refrigerated" | "special";

export type Stat = { value: V<string>; unit: V<string>; label: V<string>; note?: number };

export type Fact = { label: string; value: string };

/** Icon row shown on the hero photo (assets/icons/*). */
export type QuickSpecs = {
  type: "van" | "flatbed" | "box" | "refrigerator";
  label: string;
  drive: "FWD" | "RWD" | "AWD";
  size: string;
  range: string;
  doors: string;
  doorLabel?: string;
  charge: string;
  seats: string;
  payload: string;
  engine?: string;
};

export type Card = { image: Img; title: string; text: string; tag?: string };

export type TableRow = { head: string; cells: { text: V<string>; span?: number }[] };

export type Block =
  | { type: "title"; tagline?: string; title: string; text?: string; note?: number }
  | {
      type: "feature";
      reverse?: boolean;
      image?: Img;
      video?: { src: string; poster: Img; label: string };
      tagline: V<string>;
      title: V<string>;
      text: V<string>;
      facts?: V<Fact[]>;
      link?: { label: string; href: string };
    }
  | { type: "cards"; items: Card[] }
  | { type: "wideImage"; image: Img }
  | { type: "columns"; items: { value: string; title: string; text: string }[] }
  | { type: "table"; title: string; columns: string[]; columnNotes?: Record<number, number>; rows: TableRow[]; className?: string }
  | { type: "adas"; items: { id: string; name: string; code: string; text: string; image: Img }[] }
  | { type: "safety"; items: Card[]; chipsTitle: string; chips: string[]; extra?: string }
  | { type: "connected"; items: { title: string; text: string }[] }
  | {
      type: "specGroups";
      title: string;
      image: Img;
      groups: { heading: string; rows: { label: V<string>; value: V<string>; note?: number }[] }[];
      compare: { title: string; columns: string[]; rows: TableRow[] };
    };

export type Section = { id?: string; tone?: "tight" | "dark" | "surface"; blocks: Block[] };

export type ModelHero =
  | { kind: "intro"; image: Img; maxWidth: number }
  | { kind: "photo"; image: Img; sky: V<string>; light?: boolean; wide?: boolean; subtitle: V<string> };

export type EndCta = { title: string; text: string; image?: Img; secondary: { label: string; href: string } };

export type ModelPage = {
  /** Browser tab title suffix, e.g. "Цахилгаан фургон". Defaults to the model descriptor. */
  pageTitle?: string;
  tagline?: string;
  hero: ModelHero;
  stats: Stat[];
  /** Second stats-strip button: "Үзүүлэлт харах" (#specs) or "Туршилтын жолоодлого". */
  statsSecondary: "specs" | "test-drive";
  variants?: boolean;
  sections?: Section[];
  /** Gallery images (assets/models/<slug>/g*.jpg). */
  gallery?: Img[];
  /** Detailed spec table parsed from src/data/specs/<slug>.txt. */
  specTable?: boolean;
  end: EndCta;
  notes: string[];
};

export type Model = {
  slug: string;
  name: string;
  /** Short descriptor shown next to the name in the menu, footer and cards. */
  desc: string;
  quick?: QuickSpecs;
  page: ModelPage;
};
