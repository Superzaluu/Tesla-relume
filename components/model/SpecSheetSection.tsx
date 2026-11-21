import { SectionTitle } from "@/components/ui/SectionTitle";
import { ConfigPicker, RowHint, Value } from "@/components/model/ConfigPicker";
import type { SheetView } from "@/data/specSheet";

// One "Техникийн үзүүлэлт" section for specs and trims (they are the same information), B′ layout
// (user's Figma, 2026-11-20): trim cards, the chosen trim's standard equipment and
// every spec group as a card (ConfigPicker). With several trims, a table of only the differences opens below.

export function SpecSheetSection({ view }: { view: SheetView | null }) {
  if (!view || view.picker.options.length === 0) {
    return (
      <section className="section section--surface" id="specs">
        <div className="container"><p className="text-medium">Энэ загварын тохиргоог салбараас лавлана уу.</p></div>
      </section>
    );
  }
  const many = view.configs.length > 1;
  // R5 / EC75: the count over both sides and both powers means nothing to a visitor; name the choices instead.
  const powers = view.picker.powers;
  const intro = powers.length > 1
    ? `${powers.join(" болон ")} хувилбартай. Хүчний сонголт, иж бүрдлээ сонгоход тоноглол, үзүүлэлт доор харагдана.`
    : `Монголд нийлүүлэгдэх ${view.configs.length} иж бүрдэл. Сонгосон иж бүрдлийн тоноглол, үзүүлэлт доор харагдана.`;
  return (
    <section className="section section--surface" id="specs">
      <div className="container msheet">
        <div>
          <SectionTitle
            title={many ? "Иж бүрдлээ сонгоно уу" : "Иж бүрдэл"}
            text={many ? intro : "Монголд нийлүүлэгдэх иж бүрдлийн тоноглол, үзүүлэлт."}
          />
          {/* When the numbers were last checked (user, 2026-11-20). Update the date after the next check. */}
          <p className="msheet__checked">Үзүүлэлтийг 2026.11-д үйлдвэрлэгчийн хүснэгтээс шалгасан.</p>
        </div>

        <ConfigPicker view={view} />

        {many && view.compare.length > 0 && (
          <details className="msheet__more">
            <summary>Иж бүрдлүүдийг харьцуулах{powers.length > 1 ? "" : ` (${view.compare.length} ялгаа)`}</summary>
            <div className="msheet__more-body">
              <div className="mcompare">
                <div className="mcompare__scroll">
                  <table>
                    <thead><tr><th scope="col">Иж бүрдэл</th>{view.configs.map((name, i) => <th scope="col" key={i} data-col={i}>{name}</th>)}</tr></thead>
                    <tbody>
                      {view.compare.map((row) => (
                        <tr key={row.label}><th scope="row">{row.label}<RowHint hint={row.hint} /></th>{row.cells.map((cell, i) => <td key={i} data-col={i}><Value value={cell} /></td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {view.optional.length > 0 && <p className="mchips__title">Нэмэлт сонголтоор: {view.optional.join(", ")}</p>}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}
