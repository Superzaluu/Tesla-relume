// Filters for the homepage "Бүх загвар" grid. Pure functions, so the counts next to every option
// (encar / rbauction style) and the result list come from the same rules.
//
// Within a group the options are OR ("Задгай" or "Битүү"); groups are AND. An option's count is the
// number of models it would show given the other groups' choices, so a 0 means "nothing left".
import type { ModelCardData } from "@/components/cards/ModelSpecCard";

export type Option = { id: string; label: string; test: (card: ModelCardData) => boolean };
export type Group = { id: string; label: string; kind: "list" | "pills"; options: Option[] };
export type Selection = Record<string, string[]>;

/** Numbers in a text: "1,055–1,080 кг" → [1055, 1080]; "2–2.5 т" → [2, 2.5]. */
const numbers = (text = "") =>
  (text.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => Number(n.replace(/,(?=\d{3}\b)/g, "").replace(",", ".")));

/** [min, max] of a value, or null when it has no number. */
const span = (values: number[]): [number, number] | null => (values.length ? [Math.min(...values), Math.max(...values)] : null);
const overlaps = (value: [number, number] | null, from: number, to: number) => Boolean(value && value[0] <= to && value[1] >= from);

/** Payload in kg: "2–2.5 т" → [2000, 2500]; "Тохируулгаас хамаарна" → null. */
export function payloadKg(card: ModelCardData): [number, number] | null {
  const text = card.quick?.payload ?? "";
  if (!text || /тохируулгаас/i.test(text)) return null;
  // "\b" does not work next to Cyrillic letters, so the ton unit is matched by its neighbours.
  const tons = /(?:^|[\s\d])(?:т|тн|тонн)(?:$|[\s.,])/i.test(text) && !/кг/i.test(text);
  return span(numbers(text).map((n) => (tons ? n * 1000 : n)));
}
/** Seats: "6–14 суудал" → [6, 14]. */
export const seats = (card: ModelCardData) => span(numbers(card.quick?.seats));
/** Range in km, the highest figure of the hero value ("415–420 км" → 420). */
export const rangeKm = (card: ModelCardData) => {
  const max = span(numbers(card.quick?.range))?.[1];
  return max === undefined ? null : ([max, max] as [number, number]);
};

const FUEL_LABEL: Record<string, string> = { BEV: "Цэвэр цахилгаан", EREV: "Зай сунгагчтай", PHEV: "Хайбрид" };
const DRIVE_LABEL: Record<string, string> = { FWD: "Урд (FWD)", RWD: "Хойд (RWD)", AWD: "Бүх дугуй (AWD)" };

/** The filter groups for these cards; options no model has are left out. */
export function buildGroups(cards: ModelCardData[], categories: { id: string; label: string }[]): Group[] {
  const present = (options: Option[]) => options.filter((option) => cards.some(option.test));
  return [
    {
      id: "category", label: "Ангилал", kind: "list",
      options: present(categories.map((c) => ({ id: c.id, label: c.label, test: (card) => card.categoryId === c.id })))
    },
    {
      id: "fuel", label: "Түлшний төрөл", kind: "pills",
      options: present(["BEV", "EREV", "PHEV"].map((f) => ({ id: f, label: FUEL_LABEL[f], test: (card) => card.quick?.fuel === f })))
    },
    {
      id: "payload", label: "Даац", kind: "pills",
      options: present([
        { id: "1t", label: "1 тн хүртэл", test: (card) => overlaps(payloadKg(card), 0, 1000) },
        { id: "1-2t", label: "1–2 тн", test: (card) => overlaps(payloadKg(card), 1001, 2000) },
        { id: "2t", label: "2 тн-оос дээш", test: (card) => overlaps(payloadKg(card), 2001, 99999) }
      ])
    },
    {
      id: "seats", label: "Суудал", kind: "pills",
      options: present([
        { id: "2", label: "2", test: (card) => overlaps(seats(card), 2, 2) },
        { id: "3-5", label: "3–5", test: (card) => overlaps(seats(card), 3, 5) },
        { id: "6-9", label: "6–9", test: (card) => overlaps(seats(card), 6, 9) },
        { id: "10", label: "10+", test: (card) => overlaps(seats(card), 10, 99) }
      ])
    },
    {
      id: "range", label: "Туулах зай", kind: "pills",
      options: present([
        { id: "300", label: "300 км хүртэл", test: (card) => overlaps(rangeKm(card), 0, 299) },
        { id: "300-400", label: "300–400 км", test: (card) => overlaps(rangeKm(card), 300, 399) },
        { id: "400", label: "400 км-ээс дээш", test: (card) => overlaps(rangeKm(card), 400, 99999) }
      ])
    },
    {
      id: "drive", label: "Хөтлөгч", kind: "pills",
      options: present(["FWD", "RWD", "AWD"].map((d) => ({ id: d, label: DRIVE_LABEL[d], test: (card) => card.quick?.drive === d })))
    }
  ].filter((group) => group.options.length > 1) as Group[];
}

/** Does the card pass every group with a choice (optionally ignoring one group, for that group's counts)? */
export function passes(card: ModelCardData, groups: Group[], selection: Selection, except?: string) {
  return groups.every((group) => {
    const chosen = selection[group.id] ?? [];
    if (group.id === except || chosen.length === 0) return true;
    return group.options.some((option) => chosen.includes(option.id) && option.test(card));
  });
}

/** How many models the option would show next to the other groups' choices. */
export const optionCount = (cards: ModelCardData[], groups: Group[], selection: Selection, group: Group, option: Option) =>
  cards.filter((card) => passes(card, groups, selection, group.id) && option.test(card)).length;

export type SortId = "recommended" | "range" | "payload" | "name";
export const SORTS: { id: SortId; label: string }[] = [
  { id: "recommended", label: "Санал болгох" },
  { id: "range", label: "Туулах зай: ихээс бага" },
  { id: "payload", label: "Даац: ихээс бага" },
  { id: "name", label: "Нэрээр (А–Я)" }
];

export function sortCards(cards: ModelCardData[], sort: SortId) {
  const by = (value: (card: ModelCardData) => number) => [...cards].sort((a, b) => value(b) - value(a));
  if (sort === "range") return by((card) => rangeKm(card)?.[1] ?? -1);
  if (sort === "payload") return by((card) => payloadKg(card)?.[1] ?? -1);
  if (sort === "name") return [...cards].sort((a, b) => a.name.localeCompare(b.name, "mn"));
  return cards;
}

/** Selection ⇄ URL query (?category=flatbed,box&fuel=BEV), so a filtered view can be shared or bookmarked. */
export function readSelection(search: string, groups: Group[]): { selection: Selection; sort: SortId } {
  const params = new URLSearchParams(search);
  const selection: Selection = {};
  for (const group of groups) {
    const ids = (params.get(group.id) ?? "").split(",").filter((id) => group.options.some((option) => option.id === id));
    if (ids.length) selection[group.id] = ids;
  }
  const sort = SORTS.find((s) => s.id === params.get("sort"))?.id ?? "recommended";
  return { selection, sort };
}

export function writeSelection(selection: Selection, sort: SortId, groups: Group[]) {
  const params = new URLSearchParams(window.location.search);
  for (const group of groups) {
    const ids = selection[group.id] ?? [];
    if (ids.length) params.set(group.id, ids.join(","));
    else params.delete(group.id);
  }
  if (sort === "recommended") params.delete("sort");
  else params.set("sort", sort);
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
}
