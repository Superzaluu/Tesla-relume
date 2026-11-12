// Turns the raw rows stored in Supabase (spec_rows.cells) into table rows.
// cells[0] is the row name, the rest are values per configuration.
// - A row without values is a group heading spanning the whole table.
// - The first row with values is the header row.
// - A row shorter than the widest row stretches its last cell to fill.

export type SpecRow =
  | { kind: "group"; label: string; span: number }
  | { kind: "row"; head: boolean; label: string; cells: { text: string; span?: number }[] };

export function buildSpecRows(rows: string[][]): SpecRow[] | null {
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((row) => row.length));
  let first = true;
  return rows.map((row): SpecRow => {
    if (row.slice(1).filter(Boolean).length === 0) return { kind: "group", label: row[0], span: max };
    const head = first;
    first = false;
    return {
      kind: "row", head, label: row[0],
      cells: row.slice(1).map((text, i) => (i === row.length - 2 && row.length < max ? { text, span: max - row.length + 1 } : { text }))
    };
  });
}
