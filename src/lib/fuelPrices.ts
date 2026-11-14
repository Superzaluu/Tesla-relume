// Daily fuel prices for the savings calculator (server only).
// benzin.mn's /api/gov/feed lists the Ulaanbaatar stations registered with the government
// with their official prices. We take each company's median per fuel and average the companies.
import { FALLBACK_FUEL_PRICES, FUEL_COMPANIES, type FuelCode, type FuelPrices } from "@/data/savings";

const FEED = "https://benzin.mn/api/gov/feed";
const REFRESH_SECONDS = 6 * 60 * 60; // a few times a day; prices change rarely

type FeedItem = { brand?: string; gov?: { prices?: { product?: string; price?: number | null }[] } };

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
};

export async function getFuelPrices(): Promise<FuelPrices> {
  try {
    const res = await fetch(FEED, { next: { revalidate: REFRESH_SECONDS }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`benzin.mn ${res.status}`);
    const { items } = (await res.json()) as { items?: FeedItem[] };
    const codes: FuelCode[] = ["euro92", "ai95", "dt"];

    const companies = FUEL_COMPANIES.map(({ brand, label }) => {
      const prices: Partial<Record<FuelCode, number>> = {};
      for (const code of codes) {
        const values = (items ?? [])
          .filter((item) => item.brand === brand)
          .flatMap((item) => item.gov?.prices ?? [])
          .filter((price) => price.product === code && typeof price.price === "number" && price.price > 1000 && price.price < 20000)
          .map((price) => price.price as number);
        if (values.length) prices[code] = median(values);
      }
      return { label, prices };
    });

    const average = (code: FuelCode) => {
      const values = companies.map((company) => company.prices[code]).filter((value): value is number => typeof value === "number");
      return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : FALLBACK_FUEL_PRICES.prices[code];
    };
    return {
      prices: { euro92: average("euro92"), ai95: average("ai95"), dt: average("dt") },
      companies: companies.filter((company) => Object.keys(company.prices).length > 0),
      asOf: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ulaanbaatar" }), // YYYY-MM-DD, Mongolian date
      source: "benzin.mn"
    };
  } catch (error) {
    console.error("fuel prices: using fallback", error);
    return FALLBACK_FUEL_PRICES;
  }
}
