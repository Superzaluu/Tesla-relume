// «Эхлэх үнэ» (user, 2026-11-21): the dealer's price of a model's lowest trim (model_listings.price_from).
// The trims themselves are priced on request («Үнэ лавлах»), so only the starting price is shown.

/** 67745600 → "67,745,600 ₮". */
export const tugrik = (value: number) => `${value.toLocaleString("en-US")} ₮`;

/** "Эхлэх үнэ 67,745,600 ₮" under a card title. */
export function PriceFrom({ value, className = "m-0 mt-1 text-small text-ink-secondary" }: { value: number; className?: string }) {
  return (
    <p className={className}>
      Эхлэх үнэ <strong className="font-bold text-[#0f5a3a] tabular-nums">{tugrik(value)}</strong>
    </p>
  );
}
