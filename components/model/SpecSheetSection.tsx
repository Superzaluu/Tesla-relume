import { SectionTitle } from "@/components/ui/SectionTitle";
import { ConfigPicker } from "@/components/model/ConfigPicker";
import { bodyParts, type SheetView } from "@/data/specSheet";

// One "Техникийн үзүүлэлт" section for specs and trims (they are the same information): trim pills,
// price, ten key numbers and ten equipment lines for the chosen trim (ConfigPicker); everything else —
// what differs between trims, standard equipment and the full table — opens below on demand.

/** One cell; body-dependent values ("Задгай: … · Битүү: …") get one line per body type. */
function Value({ value }: { value: string }) {
  const parts = bodyParts(value || "–");
  if (parts.length === 1 && !parts[0][0]) return <>{value || "–"}</>;
  return <>{parts.map(([body, part]) => <span className="msheet__body" key={body}><b>{body}</b>{part}</span>)}</>;
}

export function SpecSheetSection({ view, preorder }: { view: SheetView | null; preorder: string }) {
  if (!view || view.picker.options.length === 0) {
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
          text={many ? `Монголд нийлүүлэгдэх ${view.configs.length} иж бүрдэл. Иж бүрдлээ сонгоход үзүүлэлт, тоноглол нь солигдоно.` : "Монголд нийлүүлэгдэх иж бүрдлийн үзүүлэлт."}
        />

        <ConfigPicker picker={view.picker} preorder={preorder} />

        <details className="msheet__more">
          <summary>Бүх үзүүлэлтийг харах ({view.total})</summary>
          <div className="msheet__more-body">
            {many && view.compare.length > 0 && (
              <div className="mcompare">
                <h3 className="h5">Иж бүрдлийн ялгаа</h3>
                <div className="mcompare__scroll">
                  <table>
                    <thead><tr><th scope="col">Иж бүрдэл</th>{view.configs.map((name, i) => <th scope="col" key={i} data-col={i}>{name}</th>)}</tr></thead>
                    <tbody>
                      {view.compare.map((row) => (
                        <tr key={row.label}><th scope="row">{row.label}</th>{row.cells.map((cell, i) => <td key={i} data-col={i}><Value value={cell} /></td>)}</tr>
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
                    <p className="mchips__title">{group.heading}{many ? " · бүх иж бүрдэлд стандартаар" : ""}</p>
                    <ul>{group.chips.map((chip) => <li key={chip}>{chip}</li>)}</ul>
                  </div>
                ))}
                {view.optional.length > 0 && <p className="mchips__title">Нэмэлт сонголтоор: {view.optional.join(", ")}</p>}
              </div>
            )}

            <div>
              <h3 className="h5">Бүрэн хүснэгт</h3>
              <div className="mcompare__scroll">
                <table className="mspec-table">
                  <tbody>
                    <tr className="is-head"><th scope="row">Иж бүрдэл</th>{view.configs.map((name, i) => <td key={i} data-col={i}>{name}</td>)}</tr>
                    {view.full.flatMap((group) => [
                      <tr className="is-group" key={`g-${group.heading}`}><th colSpan={view.configs.length + 1} scope="colgroup">{group.heading}</th></tr>,
                      ...group.rows.map((row, i) => {
                        const same = row.cells.every((cell) => cell === row.cells[0]);
                        return (
                          <tr key={`${group.heading}-${i}`}>
                            <th scope="row">{row.label}</th>
                            {same && many
                              ? <td colSpan={row.cells.length}><Value value={row.cells[0]} /></td>
                              : row.cells.map((cell, j) => <td key={j} data-col={j}><Value value={cell} /></td>)}
                          </tr>
                        );
                      })
                    ])}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
