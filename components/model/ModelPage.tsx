import type { Model } from "@/data/types";
import type { CalcModel } from "@/data/savings";
import { greenLoanHref, preorderHref } from "@/data/models";
import type { SheetView } from "@/data/specSheet";
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { SpecSheetSection } from "@/components/model/SpecSheetSection";
import { ModelNav, type NavItem } from "@/components/model/ModelNav";
import { ChapterView, groupChapters } from "@/components/model/Chapters";
import { QuickSpecs } from "@/components/ui/QuickSpecs";
import { FloatingSavings } from "@/components/model/FloatingSavings";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Slider } from "@/components/ui/Slider";
import { SectionView } from "@/components/model/Blocks";
import { Picture, T } from "@/components/model/VariantValues";
import { VariantProvider, VariantSection, VariantToggle } from "@/components/model/Variant";

// One template for every model. Sections only render when the model's data
// has them, so EC75/R5 (variants, ADAS, charging...) and the simpler catalog
// models share this code.

// «Хэмнэлтийн тооцоолуур» sits next to "Урьдчилсан захиалга" (Gestalt variant A, Proximity; user, 2026-11-20):
// the two actions read as one choice instead of the calculator alone on a white band under the menu.
function Hero({ model, calc }: { model: Model; calc?: CalcModel }) {
  const { hero } = model.page;
  if (hero.kind === "intro") {
    return (
      <section className="mintro">
        <div className="mintro__text">
          {/* The category line above the name and the one-sentence tagline under the descriptor were removed
              (user, 2026-11-20): name + descriptor + button only. */}
          <h1 className="mintro__title">{model.name}</h1>
          <p className="mintro__desc">{model.desc}</p>
          {/* "Урьдчилсан захиалга" moved into the sticky menu next to «Ногоон зээл» (user, 2026-11-20). */}
          <div className="actions mintro__actions">
            <FloatingSavings calc={calc} />
          </div>
        </div>
        <div className="mintro__hero-frame">
          <img
            className="mintro__image" src={hero.image.src as string} width={hero.image.width} height={hero.image.height}
            style={{ maxWidth: hero.maxWidth }} alt={hero.image.alt as string} fetchPriority="high"
          />
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
        <div className="actions mhero__actions">
          <FloatingSavings calc={calc} />
        </div>
      </div>
      <Picture image={hero.image} className="hero__bg" eager />
      {model.quick && <QuickSpecs specs={model.quick} peeks={model.page.peeks} />}
    </VariantSection>
  );
}

function Gallery({ model }: { model: Model }) {
  const images = model.page.gallery ?? [];
  if (images.length === 0) return null;
  return (
    <section className="section" id="gallery">
      <div className="container container--gap-80">
        <SectionTitle tagline="Загварын танилцуулга" title="Гадна ба дотор орчин" text="Тухайн загварын гадна хийц, ажлын тасалгаа болон жолоодлогын орчинтой танилцаарай." />
        <Slider>
          {images.map((image) => (
            <figure className="mcard mcard--plain" key={image.src as string}><Picture image={image} /></figure>
          ))}
        </Slider>
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
                    <span className="msimilar__name">{card.name}</span>
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

export function ModelPage({ model, specView, similar = [], calc }: {
  model: Model; specView?: SheetView | null; similar?: ModelCardData[];
  /** This model's savings-calculator entry (also for a model not in the menu). */
  calc?: CalcModel;
}) {
  const { page } = model;
  const preload = page.hero.kind === "photo" && typeof page.hero.image.src === "object"
    ? [page.hero.image.src.cargo, page.hero.image.src.passenger] : undefined;

  // Picture sections grouped into chapters (Gestalt variant A); the sheet's winter block joins «Хүч ба цэнэглэлт».
  const { chapters, rest } = groupChapters(page.sections ?? [], specView?.winter);
  const hasSpecs = page.specTable !== undefined || rest.some((section) => section.id === "specs");
  // In-page menu: the chapters by name, then the trims / specs and the gallery (user, 2026-11-20). "Тойм" is
  // "Эхлэл"; «Ногоон зээл» opens its own page. Equipment and winter live inside «Иж бүрдэл» / «Хүч ба цэнэглэлт».
  const nav: NavItem[] = [
    { id: "overview", label: "Эхлэл" },
    ...chapters.map((chapter) => ({ id: chapter.id, label: chapter.label })),
    ...(hasSpecs ? [{ id: "specs", label: "Иж бүрдэл" }] : []),
    ...((page.gallery ?? []).length > 0 ? [{ id: "gallery", label: "Зураг" }] : []),
    { id: "green-loan", label: "Ногоон зээл", href: greenLoanHref(model.slug) }
  ];

  const content = (
    <main id="overview">
      <Hero model={model} calc={calc} />
      <ModelNav items={nav} preorder={preorderHref(model.slug)} />
      <RevealOnScroll />
      {chapters.map((chapter) => <ChapterView chapter={chapter} key={chapter.id} />)}
      {rest.map((section, i) => <SectionView section={section} key={section.id ?? i} />)}
      {page.specTable !== undefined && <SpecSheetSection view={specView ?? null} />}
      <Gallery model={model} />
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
