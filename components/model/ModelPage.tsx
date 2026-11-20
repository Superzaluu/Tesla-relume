import type { Model } from "@/data/types";
import { greenLoanHref, preorderHref } from "@/data/models";
import type { SheetView } from "@/data/specSheet";
import type { ModelCardData } from "@/components/cards/ModelSpecCard";
import { SpecSheetSection } from "@/components/model/SpecSheetSection";
import { ModelNav, type NavItem } from "@/components/model/ModelNav";
import { WinterSection } from "@/components/model/WinterSection";
import { QuickSpecs } from "@/components/ui/QuickSpecs";
import { SavingsTrigger } from "@/components/forms/SavingsCalculator";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Slider } from "@/components/ui/Slider";
import { LoadingLink } from "@/components/ui/LoadingLink";
import { SectionView } from "@/components/model/Blocks";
import { Picture, T } from "@/components/model/VariantValues";
import { VariantProvider, VariantSection, VariantToggle } from "@/components/model/Variant";

// One template for every model. Sections only render when the model's data
// has them, so EC75/R5 (variants, ADAS, charging...) and the simpler catalog
// models share this code.

function Hero({ model, category }: { model: Model; category?: string }) {
  const { hero, tagline } = model.page;
  if (hero.kind === "intro") {
    return (
      <section className="mintro">
        <div className="mintro__text">
          {category && <p className="tagline">{category}</p>}
          <h1 className="mintro__title">{model.name}</h1>
          <p className="mintro__desc">{model.desc}</p>
          {tagline && <p className="mintro__tagline">{tagline}</p>}
          <div className="actions mintro__actions">
            <LoadingLink className="btn btn--primary btn--wide" href={preorderHref(model.slug)}>Урьдчилсан захиалга</LoadingLink>
          </div>
        </div>
        <div className="mintro__hero-frame">
          <img
            className="mintro__image" src={hero.image.src as string} width={hero.image.width} height={hero.image.height}
            style={{ maxWidth: hero.maxWidth }} alt={hero.image.alt as string} fetchPriority="high"
          />
          {model.quick && <QuickSpecs specs={model.quick} />}
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
          <LoadingLink className="btn btn--primary btn--wide" href={preorderHref(model.slug)}>Урьдчилсан захиалга</LoadingLink>
        </div>
      </div>
      <Picture image={hero.image} className="hero__bg" eager />
      {model.quick && <QuickSpecs specs={model.quick} />}
    </VariantSection>
  );
}

/**
 * Action bar under the hero. The key numbers that used to sit here are in the hero icon strip
 * (range, charging, motor) or in the spec table. "Урьдчилсан захиалга" is in the hero just above
 * (and again at the end of the page), so here only the money questions remain.
 */
function ActionBar({ model }: { model: Model }) {
  return (
    <section className="mstats mstats--actions" id="finance" aria-label="Зээл ба хэмнэлт">
      <div className="mstats__inner">
        <div className="actions mstats__actions">
          <SavingsTrigger model={model.slug} />
          <a className="btn btn--tint btn--wide" href={greenLoanHref(model.slug)}>Ногоон зээл</a>
        </div>
      </div>
    </section>
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

function EndCta({ model }: { model: Model }) {
  const { end } = model.page;
  return (
    <section className="section mend" id="test-drive">
      <div className="container mend__inner">
        <h2 className="h2">{end.title}</h2>
        <p className="text-medium">{end.text}</p>
        {end.image && <Picture image={end.image} className="mend__image" />}
        <div className="actions mend__actions">
          <LoadingLink className="btn btn--primary btn--wide" href={preorderHref(model.slug)}>Урьдчилсан захиалга</LoadingLink>
          <a className="btn btn--secondary btn--wide" href={end.secondary.href}>{end.secondary.label}</a>
        </div>
      </div>
    </section>
  );
}

export function ModelPage({ model, category, specView, similar = [] }: { model: Model; category?: string; specView?: SheetView | null; similar?: ModelCardData[] }) {
  const { page } = model;
  const preload = page.hero.kind === "photo" && typeof page.hero.image.src === "object"
    ? [page.hero.image.src.cargo, page.hero.image.src.passenger] : undefined;

  // In-page menu (4.1): only the sections this model has. EC75 / R5 have hand-made sections in code
  // ("specs", and "assist" / "safety" for the equipment) instead of the spec sheet.
  const own = new Set((page.sections ?? []).map((section) => section.id).filter(Boolean));
  // "equipment" is the chosen trim's standard-equipment chips inside the spec section (ConfigPicker).
  const hasEquipment = page.specTable !== undefined && Boolean(specView?.picker.options.some((option) => option.standard.length > 0));
  const equipmentId = hasEquipment ? "equipment" : own.has("assist") ? "assist" : own.has("safety") ? "safety" : undefined;
  const showWinter = Boolean(specView) && !own.has("winter");
  const nav: NavItem[] = [
    { id: "overview", label: "Тойм" },
    ...(page.specTable !== undefined || own.has("specs") ? [{ id: "specs", label: "Үзүүлэлт" }] : []),
    ...(equipmentId ? [{ id: equipmentId, label: "Тоноглол" }] : []),
    ...((page.gallery ?? []).length > 0 ? [{ id: "gallery", label: "Зураг" }] : []),
    ...(showWinter || own.has("winter") ? [{ id: "winter", label: "Өвлийн нөхцөлд" }] : []),
    { id: "finance", label: "Санхүүжилт" }
  ];

  const content = (
    <main id="overview">
      <Hero model={model} category={category} />
      <ModelNav items={nav} />
      <ActionBar model={model} />
      {page.sections?.map((section, i) => <SectionView section={section} key={section.id ?? i} />)}
      {page.specTable !== undefined && <SpecSheetSection view={specView ?? null} model={model.name} preorder={preorderHref(model.slug)} />}
      {/* B′ menu order: Үзүүлэлт → Тоноглол → Зураг → Өвлийн нөхцөлд. */}
      <Gallery model={model} />
      {/* 4.4: models with their own winter section in code (EC75) keep it instead. */}
      {showWinter && <WinterSection winter={specView!.winter} />}
      <Similar cards={similar} />
      <EndCta model={model} />
      <section className="mnotes" aria-label="Тайлбар">
        <ol>{page.notes.map((note) => <li key={note}>{note}</li>)}</ol>
      </section>
    </main>
  );

  return page.variants ? <VariantProvider preload={preload}>{content}</VariantProvider> : content;
}
