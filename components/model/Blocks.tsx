import type { Block, Card, Img, Section, TableRow } from "@/data/types";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Slider } from "@/components/ui/Slider";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { Facts, Picture, T } from "@/components/model/VariantValues";
import { VariantToggle } from "@/components/model/Variant";

type FeatureBlock = Extract<Block, { type: "feature" }>;

/**
 * Model page standard (user, 2026-11-20): a picture that does not exist yet is left out, never shown as a
 * "Coming soon" box. The text keeps its place: a feature goes full width, a card becomes a text card, a wide
 * picture is skipped. Story sections still pass the placeholder file, so it is recognised here.
 */
export const hasPicture = (image?: Img) =>
  Boolean(image) && !(typeof image!.src === "string" && image!.src.endsWith("coming-soon.svg"));

const featureClass = (block: FeatureBlock) =>
  `mfeature${block.reverse ? " mfeature--reverse" : ""}${!hasPicture(block.image) && !block.video ? " mfeature--solo" : ""}`;

function CardView({ card, grid = false }: { card: Card; grid?: boolean }) {
  const pictured = hasPicture(card.image);
  return (
    <figure className={`mcard${grid ? " mcard--grid" : ""}${pictured ? "" : " mcard--text"}`} id={card.id}>
      {pictured && <Picture image={card.image} />}
      <figcaption><h3>{card.title}{card.tag && <> <span>{card.tag}</span></>}</h3><p>{card.text}</p></figcaption>
    </figure>
  );
}

function FeatureContent({ block }: { block: FeatureBlock }) {
  return (
    <>
      {block.image && hasPicture(block.image) && <Picture image={block.image} className="mfeature__image" />}
      {block.video && (
        <VideoPoster className="mvideo" src={block.video.src} label={block.video.label}>
          <img className="mvideo__poster" src={block.video.poster.src as string} width={block.video.poster.width} height={block.video.poster.height} alt="" loading="lazy" />
          <img className="mvideo__play" src="/assets/play-button.svg" width={64} height={64} alt="" />
        </VideoPoster>
      )}
      <div className="mfeature__text">
        <p className="tagline"><T v={block.tagline} /></p>
        <h2 className="h2"><T v={block.title} /></h2>
        <p className="text-medium"><T v={block.text} /></p>
        {block.facts && <Facts facts={block.facts} />}
        {block.link && (
          <a className="btn btn--link" href={block.link.href}>{block.link.label}
            <img src="/assets/chevron-right.svg" width={24} height={24} alt="" />
          </a>
        )}
      </div>
    </>
  );
}

function Rows({ rows }: { rows: TableRow[] }) {
  return (
    <tbody>
      {rows.map((row) => (
        <tr key={row.head}>
          <th scope="row">{row.head}</th>
          {row.cells.map((cell, i) => <td key={i} colSpan={cell.span}><T v={cell.text} /></td>)}
        </tr>
      ))}
    </tbody>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "title":
      return <SectionTitle tagline={block.tagline} title={block.title} text={block.text} note={block.note} />;
    case "feature":
      return <div className={featureClass(block)}><FeatureContent block={block} /></div>;
    case "cards":
      return (
        <Slider>
          {block.items.map((card) => <CardView card={card} key={card.title} />)}
        </Slider>
      );
    case "wideImage":
      return hasPicture(block.image) ? <Picture image={block.image} className="mwide" /> : null;
    case "columns":
      return (
        <div className="mcolumns">
          {block.items.map((item) => (
            <div className="mcolumn" key={item.title}><p className="mcolumn__value">{item.value}</p><h3>{item.title}</h3><p>{item.text}</p></div>
          ))}
        </div>
      );
    case "table":
      return (
        <div className={block.className}>
          <h3 className="mbattery__title">{block.title}</h3>
          <div className="mcompare__scroll">
            <table>
              <thead>
                <tr>{block.columns.map((column, i) => <th scope="col" key={column}>{column}{block.columnNotes?.[i] ? <> <sup>{block.columnNotes[i]}</sup></> : null}</th>)}</tr>
              </thead>
              <Rows rows={block.rows} />
            </table>
          </div>
        </div>
      );
    case "adas":
      // Same picture cards as the safety section: every photo visible at once, no tabs to discover.
      return (
        <div className="msafety">
          {block.items.map((item) => <CardView card={{ image: item.image, title: item.name, tag: item.code, text: item.text }} grid key={item.id} />)}
        </div>
      );
    case "safety":
      return (
        <>
          <div className="msafety">
            {block.items.map((card) => <CardView card={card} grid key={card.title} />)}
          </div>
          {block.chips && block.chips.length > 0 && (
            <div className="mchips">
              <p className="mchips__title">{block.chipsTitle}</p>
              <ul className="spotlight">{block.chips.map((chip) => <li key={chip}>{chip}</li>)}</ul>
              {block.extra && <p className="mchips__title">{block.extra}</p>}
            </div>
          )}
        </>
      );
    case "specGroups":
      return (
        <>
          <div className="mspecs__head">
            <h2 className="h2">{block.title}</h2>
            <VariantToggle />
          </div>
          <div className="mspecs">
            <Picture image={block.image} className="mspecs__image" />
            <div className="mspecs__groups">
              {block.groups.map((group) => (
                <dl className="mspecs__group" key={group.heading}>
                  <dt className="mspecs__heading">{group.heading}</dt>
                  {group.rows.map((row, i) => (
                    <dd key={i}><span><T v={row.label} />{row.note ? <> <sup>{row.note}</sup></> : null}</span><strong><T v={row.value} /></strong></dd>
                  ))}
                </dl>
              ))}
            </div>
          </div>
          <div className="mcompare">
            <h3 className="h5">{block.compare.title}</h3>
            <div className="mcompare__scroll">
              <table>
                <thead><tr>{block.compare.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
                <Rows rows={block.compare.rows} />
              </table>
            </div>
          </div>
        </>
      );
  }
}

/**
 * A section inside a chapter (ChapterView): no page-wide band, padding or tone of its own; the chapter's tinted
 * box holds it. Keeps its id so menu and hero-preview links still land on it.
 */
export function PartView({ section }: { section: Section }) {
  const [only] = section.blocks;
  const single = section.blocks.length === 1 && only.type === "feature" ? only : null;
  return (
    <div className="mchapter__part" id={section.id}>
      {single ? (
        <div className={featureClass(single)}><FeatureContent block={single} /></div>
      ) : (
        section.blocks.map((block, i) => <BlockView block={block} key={i} />)
      )}
    </div>
  );
}

const TONE = { tight: " section--tight", dark: " section--dark", surface: " section--surface" } as const;

/** One page section. A lone feature block becomes the container itself, as in the original markup. */
export function SectionView({ section }: { section: Section }) {
  const [only] = section.blocks;
  const single = section.blocks.length === 1 && only.type === "feature" ? only : null;
  return (
    <section className={`section${section.tone ? TONE[section.tone] : ""}`} id={section.id}>
      {single ? (
        <div className={`container ${featureClass(single)}`}><FeatureContent block={single} /></div>
      ) : (
        <div className="container container--gap-80">
          {section.blocks.map((block, i) => <BlockView block={block} key={i} />)}
        </div>
      )}
    </section>
  );
}
