import { SectionTitle } from "@/components/ui/SectionTitle";
import type { SheetView } from "@/data/specSheet";

// The "Техникийн үзүүлэлт" section built from the structured spec sheet, laid out like the R5 page:
// summary blocks → highlights → comparison of what differs → standard equipment chips → full table (collapsed).

export function SpecSheetSection({ view }: { view: SheetView | null }) {
  if (!view || view.summary.length === 0) {
    return (
      <section className="section section--surface" id="specs">
        <div className="container"><p className="text-medium">Энэ загварын тохиргоог салбараас лавлана уу.</p></div>
      </section>
    );
  }
  const many = view.configs.length > 1;
  return (
    <section className="section section--surface" id="specs">
      <div className="container msheet">
        <SectionTitle
          title="Техникийн үзүүлэлт"
          text={many ? `Монголд нийлүүлэгдэх ${view.configs.length} тохиргоо. Тохиргооноос хамаарах утгыг хүрээгээр харуулав.` : "Монголд нийлүүлэгдэх тохиргооны үзүүлэлт."}
        />

        <div className="msheet__summary">
          {view.summary.map((group) => (
            <dl className="mspecs__group" key={group.heading}>
              <dt className="mspecs__heading">{group.heading}</dt>
              {group.rows.map((row) => (
                <dd key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.href ? <a href={row.href}>{row.value}</a> : row.value}</strong>
                </dd>
              ))}
            </dl>
          ))}
        </div>

        {view.highlights.length > 0 && (
          <div>
            <h3 className="h5 msheet__title">Онцлох тоноглол</h3>
            <ul className="mconnected">
              {view.highlights.map((item) => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}
            </ul>
          </div>
        )}

        {many && view.compare.length > 0 && (
          <div className="mcompare">
            <h3 className="h5">Тохиргооны харьцуулалт</h3>
            <div className="mcompare__scroll">
              <table>
                <thead><tr><th scope="col">Тохиргоо</th>{view.configs.map((name, i) => <th scope="col" key={i}>{name}</th>)}</tr></thead>
                <tbody>
                  {view.compare.map((row) => (
                    <tr key={row.label}><th scope="row">{row.label}</th>{row.cells.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view.chips.length > 0 && (
          <div className="msheet__chips">
            {view.chips.map((group) => (
              <div className="mchips" key={group.heading}>
                <p className="mchips__title">{group.heading}{many ? " · бүх тохиргоонд стандартаар" : ""}</p>
                <ul>{group.chips.map((chip) => <li key={chip}>{chip}</li>)}</ul>
              </div>
            ))}
            {view.optional.length > 0 && <p className="mchips__title">Нэмэлт сонголтоор: {view.optional.join(", ")}</p>}
          </div>
        )}

        <details className="msheet__full">
          <summary>Бүх үзүүлэлтийг харах</summary>
          <div className="mcompare__scroll">
            <table className="mspec-table">
              <tbody>
                <tr className="is-head"><th scope="row">Тохиргоо</th>{view.configs.map((name, i) => <td key={i}>{name}</td>)}</tr>
                {view.full.flatMap((group) => [
                  <tr className="is-group" key={`g-${group.heading}`}><th colSpan={view.configs.length + 1} scope="colgroup">{group.heading}</th></tr>,
                  ...group.rows.map((row, i) => {
                    const same = row.cells.every((cell) => cell === row.cells[0]);
                    return (
                      <tr key={`${group.heading}-${i}`}>
                        <th scope="row">{row.label}</th>
                        {same && many
                          ? <td colSpan={row.cells.length}>{row.cells[0] || "–"}</td>
                          : row.cells.map((cell, j) => <td key={j}>{cell || "–"}</td>)}
                      </tr>
                    );
                  })
                ])}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}
