import type { Block, Section, TableRow } from "@/data/types";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Slider } from "@/components/ui/Slider";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { AdasTabs } from "@/components/model/AdasTabs";
import { Facts, Picture, T } from "@/components/model/VariantValues";
import { VariantToggle } from "@/components/model/Variant";

type FeatureBlock = Extract<Block, { type: "feature" }>;

function FeatureContent({ block }: { block: FeatureBlock }) {
  return (
    <>
      {block.image && <Picture image={block.image} className="mfeature__image" />}
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
      return <div className={`mfeature${block.reverse ? " mfeature--reverse" : ""}`}><FeatureContent block={block} /></div>;
    case "cards":
      return (
        <Slider>
          {block.items.map((card) => (
            <figure className="mcard" key={card.title}>
              <Picture image={card.image} />
              <figcaption><h3>{card.title}</h3><p>{card.text}</p></figcaption>
            </figure>
          ))}
        </Slider>
      );
    case "wideImage":
      return <Picture image={block.image} className="mwide" />;
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
      return <AdasTabs items={block.items} />;
    case "safety":
      return (
        <>
          <div className="msafety">
            {block.items.map((card) => (
              <figure className="mcard mcard--grid" key={card.title}>
                <Picture image={card.image} />
                <figcaption><h3>{card.title} <span>{card.tag}</span></h3><p>{card.text}</p></figcaption>
              </figure>
            ))}
          </div>
          <div className="mchips">
            <p className="mchips__title">{block.chipsTitle}</p>
            <ul>{block.chips.map((chip) => <li key={chip}>{chip}</li>)}</ul>
            {block.extra && <p className="mchips__title">{block.extra}</p>}
          </div>
        </>
      );
    case "connected":
      return <ul className="mconnected">{block.items.map((item) => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}</ul>;
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

const TONE = { tight: " section--tight", dark: " section--dark", surface: " section--surface" } as const;

/** One page section. A lone feature block becomes the container itself, as in the original markup. */
export function SectionView({ section }: { section: Section }) {
  const [only] = section.blocks;
  const single = section.blocks.length === 1 && only.type === "feature" ? only : null;
  return (
    <section className={`section${section.tone ? TONE[section.tone] : ""}`} id={section.id}>
      {single ? (
        <div className={`container mfeature${single.reverse ? " mfeature--reverse" : ""}`}><FeatureContent block={single} /></div>
      ) : (
        <div className="container container--gap-80">
          {section.blocks.map((block, i) => <BlockView block={block} key={i} />)}
        </div>
      )}
    </section>
  );
}
