import type { Model } from "@/data/types";
import type { SpecRow } from "@/data/specTable";
import { QuickSpecs } from "@/components/ui/QuickSpecs";
import { SavingsTrigger } from "@/components/forms/SavingsCalculator";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Slider } from "@/components/ui/Slider";
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
      </div>
      <Picture image={hero.image} className="hero__bg" eager />
      {model.quick && <QuickSpecs specs={model.quick} />}
      <SavingsTrigger />
    </VariantSection>
  );
}

function Stats({ model }: { model: Model }) {
  const { stats, statsSecondary } = model.page;
  return (
    <section className="mstats" aria-label="Гол үзүүлэлт">
      <div className="mstats__inner">
        {stats.length > 0 && (
          <dl className="mstats__list">
            {stats.map((stat, i) => (
              <div className="mstat" key={i}>
                <dt className="mstat__label"><T v={stat.label} />{stat.note ? <> <sup>{stat.note}</sup></> : null}</dt>
                <dd className="mstat__value"><T v={stat.value} /><span><T v={stat.unit} /></span></dd>
              </div>
            ))}
          </dl>
        )}
        <div className="actions mstats__actions">
          <a className="btn btn--primary btn--wide" href="#test-drive">Урьдчилсан захиалга</a>
          {statsSecondary === "specs"
            ? <a className="btn btn--secondary btn--wide" href="#specs">Үзүүлэлт харах</a>
            : <a className="btn btn--secondary btn--wide" href="#test-drive">Туршилтын жолоодлого</a>}
        </div>
      </div>
    </section>
  );
}

function Gallery({ model }: { model: Model }) {
  const images = model.page.gallery ?? [];
  if (images.length === 0) return null;
  return (
    <section className="section">
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

function SpecTableSection({ rows }: { rows: SpecRow[] | null }) {
  if (!rows) {
    return (
      <section className="section section--surface" id="specs">
        <div className="container"><p className="text-medium">Энэ загварын тохиргоог салбараас лавлана уу.</p></div>
      </section>
    );
  }
  return (
    <section className="section section--surface" id="specs">
      <div className="container container--gap-80">
        <SectionTitle title="Техникийн үзүүлэлт" text="Тохиргоо бүрийн дэлгэрэнгүй үзүүлэлт. Хүснэгтийг хажуу тийш гүйлгэж үзнэ үү." />
        <div className="mcompare__scroll">
          <table className="mspec-table">
            <tbody>
              {rows.map((row, i) => row.kind === "group" ? (
                <tr className="is-group" key={i}><th colSpan={row.span} scope="colgroup">{row.label}</th></tr>
              ) : (
                <tr className={row.head ? "is-head" : undefined} key={i}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, j) => <td key={j} colSpan={cell.span}>{cell.text}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <a className="btn btn--primary btn--wide" href="#">Урьдчилсан захиалга</a>
          <a className="btn btn--secondary btn--wide" href={end.secondary.href}>{end.secondary.label}</a>
        </div>
      </div>
    </section>
  );
}

export function ModelPage({ model, category, specRows }: { model: Model; category?: string; specRows?: SpecRow[] | null }) {
  const { page } = model;
  const preload = page.hero.kind === "photo" && typeof page.hero.image.src === "object"
    ? [page.hero.image.src.cargo, page.hero.image.src.passenger] : undefined;

  const content = (
    <main>
      <Hero model={model} category={category} />
      <Stats model={model} />
      {page.sections?.map((section, i) => <SectionView section={section} key={section.id ?? i} />)}
      <Gallery model={model} />
      {page.specTable !== undefined && <SpecTableSection rows={specRows ?? null} />}
      <EndCta model={model} />
      <section className="mnotes" aria-label="Тайлбар">
        <ol>{page.notes.map((note) => <li key={note}>{note}</li>)}</ol>
      </section>
    </main>
  );

  return page.variants ? <VariantProvider preload={preload}>{content}</VariantProvider> : content;
}
