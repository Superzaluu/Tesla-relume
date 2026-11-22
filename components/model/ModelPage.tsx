import type { Model } from "@/data/types";
import { brandName } from "@/data/brand";
import type { CalcModel } from "@/data/savings";
import { greenLoanHref, preorderHref } from "@/data/models";
import type { SheetView } from "@/data/specSheet";
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { SpecSheetSection } from "@/components/model/SpecSheetSection";
import { ModelNav, type NavItem } from "@/components/model/ModelNav";
import { ChapterView, groupChapters } from "@/components/model/Chapters";
import { QuickSpecs } from "@/components/ui/QuickSpecs";
import { HeroPhotoActions } from "@/components/model/HeroPhotoActions";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionView } from "@/components/model/Blocks";
import { albumOf, type AlbumItem } from "@/data/albums";
import { Picture, T } from "@/components/model/VariantValues";
import { VariantPriceFrom, VariantProvider, VariantSection, VariantToggle } from "@/components/model/Variant";
import type { Variant } from "@/data/types";

// One template for every model. Sections only render when the model's data
// has them, so EC75/R5 (variants, ADAS, charging...) and the simpler catalog
// models share this code.

// «Хэмнэлтийн тооцоолуур» lives in the sticky menu between "Урьдчилсан захиалга" and "Туршилтын жолоодлого"
// since 2026-11-21 (user): it starts there and follows the mouse from there (ModelNav → FloatingSavings).
function Hero({ model, prices, gallery }: { model: Model; prices: Prices; gallery: boolean }) {
  const { hero } = model.page;
  if (hero.kind === "intro") {
    return (
      <section className="mintro">
        <div className="mintro__text">
          {/* The category line above the name and the one-sentence tagline under the descriptor were removed
              (user, 2026-11-20): name + descriptor only. EC75 / R5 (cargo + passenger on one page) get their
              switch here, the photo follows it (user, 2026-11-21: their full-bleed photo hero was not the standard).
              «Эхлэх үнэ» under the descriptor (user, 2026-11-21): the lowest trim's price of the side shown. */}
          {/* «Ruichi» before the name (user test #1, item 11: people did not know what a "C5" is). */}
          <h1 className="mintro__title"><span className="mintro__brand">Ruichi</span> {model.name}</h1>
          <p className="mintro__desc">{model.desc}</p>
          <VariantPriceFrom prices={prices} className="mintro__price" />
          {model.page.variants && <div className="actions mintro__actions"><VariantToggle /></div>}
        </div>
        <div className="mintro__hero-frame">
          <HeroPhotoActions gallery={gallery}>
            <Picture image={hero.image} className="mintro__image" style={{ maxWidth: hero.maxWidth, objectPosition: hero.position }} eager />
          </HeroPhotoActions>
          {model.quick && <QuickSpecs specs={model.quick} peeks={model.page.peeks} />}
        </div>
      </section>
    );
  }
  const className = ["hero", "mhero", hero.light && "mhero--light", hero.wide && "mhero--wide"].filter(Boolean).join(" ");
  return (
    <VariantSection sky={hero.sky} className={className}>
      <div className="hero__content">
        <p className="hero__eyebrow">Ruichi</p>
        <h1 className="mhero__title">{model.name}</h1>
        <p className="hero__subtitle"><T v={hero.subtitle} /></p>
        {model.page.variants && <VariantToggle onPhoto />}
      </div>
      <Picture image={hero.image} className="hero__bg" eager />
      {model.quick && <QuickSpecs specs={model.quick} peeks={model.page.peeks} />}
    </VariantSection>
  );
}

// «Гадна ба дотор орчин» as a photo album (user, 2026-11-20): up to 6 of the model's own photos, the first one
// large, each with its caption on the photo (src/data/albums.ts). Replaces the old slider of rc-ev posters.
function Album({ items }: { items: AlbumItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="section" id="gallery">
      <div className="container container--gap-80">
        <SectionTitle tagline="Загварын танилцуулга" title="Гадна ба дотор орчин" text="Тухайн загварын гадна хийц, ажлын тасалгаа болон жолоодлогын орчинтой танилцаарай." />
        <div className="malbum" data-count={items.length}>
          {items.map((item) => (
            <figure className="malbum__item" key={item.src}>
              <img src={item.src} width={item.width} height={item.height} alt={item.title} loading="lazy" />
              <figcaption>
                {item.tag && <span className="malbum__tag">{item.tag}</span>}
                <strong>{item.title}</strong>
                {item.text && <span>{item.text}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** B′ "Төстэй загварууд": other models of the same menu category, key number first. */
function Similar({ cards }: { cards: ModelCardData[] }) {
  if (cards.length === 0) return null;
  return (
    <section className="section" id="similar">
      <div className="container msimilar">
        <h2 className="h3">Төстэй загварууд</h2>
        <ul className="msimilar__list">
          {cards.map((card) => {
            const stat = card.stats[0];
            return (
              <li key={card.key}>
                <a className="msimilar__card" href={card.href}>
                  <img src={card.thumb} alt="" width={400} height={240} loading="lazy" />
                  <span className="msimilar__text">
                    {stat && <span className="msimilar__value">{stat.value}<small> {stat.unit}</small></span>}
                    {stat && <span className="msimilar__label">{stat.label}</span>}
                    <span className="msimilar__name">{brandName(card.name)}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** «Эхлэх үнэ» per side, from the page's menu cards (model_listings.price_from); a one-version model uses cargo. */
export type Prices = Partial<Record<Variant, number>>;

export function ModelPage({ model, specView, similar = [], calc, prices = {} }: {
  model: Model; specView?: SheetView | null; similar?: ModelCardData[];
  /** This model's savings-calculator entry (also for a model not in the menu). */
  calc?: CalcModel;
  prices?: Prices;
}) {
  const { page } = model;
  const preload = typeof page.hero.image.src === "object"
    ? [page.hero.image.src.cargo, page.hero.image.src.passenger] : undefined;

  // Picture sections grouped into chapters (Gestalt variant A); the sheet's winter block joins «Хүч ба цэнэглэлт».
  const { chapters, rest } = groupChapters(page.sections ?? [], specView?.winter);
  const album = albumOf(model.slug);
  const hasSpecs = page.specTable !== undefined || rest.some((section) => section.id === "specs");
  // In-page menu: the chapters by name, then the trims / specs and the gallery (user, 2026-11-20). "Тойм" is
  // "Эхлэл"; «Ногоон зээл» opens its own page. Equipment and winter live inside «Иж бүрдэл» / «Хүч ба цэнэглэлт».
  const nav: NavItem[] = [
    { id: "overview", label: "Эхлэл" },
    ...chapters.map((chapter) => ({ id: chapter.id, label: chapter.label })),
    ...(hasSpecs ? [{ id: "specs", label: "Иж бүрдэл" }] : []),
    ...(album.length > 0 ? [{ id: "gallery", label: "Зураг" }] : []),
    { id: "green-loan", label: "Ногоон зээл", href: greenLoanHref(model.slug) }
  ];

  const content = (
    <main id="overview">
      <Hero model={model} prices={prices} gallery={album.length > 0} />
      <ModelNav items={nav} preorder={preorderHref(model.slug)} calc={calc} />
      <RevealOnScroll />
      {chapters.map((chapter) => <ChapterView chapter={chapter} key={chapter.id} />)}
      {rest.map((section, i) => <SectionView section={section} key={section.id ?? i} />)}
      {page.specTable !== undefined && <SpecSheetSection view={specView ?? null} prices={prices} />}
      <Album items={album} />
      <Similar cards={similar} />
      {/* The closing «Туршаад үзэх үү?» block was removed (user, 2026-11-20): "Урьдчилсан захиалга" is in the
          hero and «Ногоон зээл» in the bar under it. */}
      <section className="mnotes" aria-label="Тайлбар">
        <ol>{page.notes.map((note) => <li key={note}>{note}</li>)}</ol>
      </section>
    </main>
  );

  return page.variants ? <VariantProvider preload={preload}>{content}</VariantProvider> : content;
}
