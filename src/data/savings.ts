// Savings calculator: shared types, assumptions and the calculation (used in the browser and on the server).
import { calculateLoan, type IncomeType, type LoanResult } from "@/data/greenLoan";
import type { FuelType } from "@/data/types";

export type FuelCode = "euro92" | "ai95" | "dt";
export const FUEL_LABELS: Record<FuelCode, string> = { euro92: "Евро-92", ai95: "АИ-95", dt: "Дизель" };

/** Companies averaged for the fuel price (benzin.mn brand codes). Plain АИ-92 is left out on purpose: its price is held down. */
export const FUEL_COMPANIES = [
  { brand: "petrovis", label: "Петровис" },
  { brand: "shunkhlai", label: "Шунхлай" },
  { brand: "sod-mongol", label: "Сод Монгол" },
  { brand: "magnai-trade", label: "Магнай Трейд" }
] as const;

export type FuelPrices = {
  /** Average of the companies' median Ulaanbaatar price, ₮ per litre. */
  prices: Record<FuelCode, number>;
  companies: { label: string; prices: Partial<Record<FuelCode, number>> }[];
  /** YYYY-MM-DD of the data. */
  asOf: string;
  source: "benzin.mn" | "fallback";
};

/** Used when benzin.mn cannot be reached: the averages on 2026-11-14. */
export const FALLBACK_FUEL_PRICES: FuelPrices = {
  prices: { euro92: 5143, ai95: 5473, dt: 5448 },
  companies: [],
  asOf: "2026-11-14",
  source: "fallback"
};

export const ELECTRICITY_PRICE = 280; // ₮ per kWh (charging tariff assumption)
export const DEFAULT_EV_CONSUMPTION = 22; // kWh/100 km when the factory figure is not known
export const EXTENDER_FUEL_USE = 6.1; // l/100 km on petrol once the battery is used up (C5 EREV, NEDC)
export const SERVICE_SAVING_PER_KM = 45; // ₮ less maintenance per km (no oil, filters, ...)

/**
 * Vehicles the visitor can pick as "my car". Consumption is an approximate mixed-driving figure
 * (estimate, 2026-11-14) — the visitor can still type their own value.
 */
export type CompareVehicle = { id: string; group: string; name: string; fuel: FuelCode; consumption: number };
export const COMPARE_VEHICLES: CompareVehicle[] = [
  { id: "porter2", group: "Ачааны машин, фургон", name: "Hyundai Porter II 2.5", fuel: "dt", consumption: 10.5 },
  { id: "bongo3", group: "Ачааны машин, фургон", name: "Kia Bongo III", fuel: "dt", consumption: 10.5 },
  { id: "starex", group: "Ачааны машин, фургон", name: "Hyundai Grand Starex 2.5", fuel: "dt", consumption: 11 },
  { id: "hiace", group: "Ачааны машин, фургон", name: "Toyota HiAce 2.8 дизель", fuel: "dt", consumption: 11 },
  { id: "elf", group: "Ачааны машин, фургон", name: "Isuzu Elf 3.0", fuel: "dt", consumption: 13 },
  { id: "canter", group: "Ачааны машин, фургон", name: "Mitsubishi Fuso Canter 3.0", fuel: "dt", consumption: 13 },
  { id: "dyna", group: "Ачааны машин, фургон", name: "Toyota Dyna 3.0", fuel: "dt", consumption: 13 },
  { id: "mighty", group: "Ачааны машин, фургон", name: "Hyundai Mighty 3.9", fuel: "dt", consumption: 15 },
  { id: "prius", group: "Суудлын машин", name: "Toyota Prius 1.8 (хайбрид)", fuel: "euro92", consumption: 4.5 },
  { id: "probox", group: "Суудлын машин", name: "Toyota Probox 1.5", fuel: "euro92", consumption: 6.5 },
  { id: "camry", group: "Суудлын машин", name: "Toyota Camry 2.5", fuel: "euro92", consumption: 8 },
  { id: "rav4", group: "Суудлын машин", name: "Toyota RAV4 2.0", fuel: "euro92", consumption: 8.5 },
  { id: "xtrail", group: "Суудлын машин", name: "Nissan X-Trail 2.5", fuel: "euro92", consumption: 9 },
  { id: "santafe", group: "Суудлын машин", name: "Hyundai Santa Fe 2.2 дизель", fuel: "dt", consumption: 8.5 },
  { id: "alphard", group: "Суудлын машин", name: "Toyota Alphard 2.5", fuel: "euro92", consumption: 10 },
  { id: "lc200d", group: "Суудлын машин", name: "Toyota Land Cruiser 200 дизель", fuel: "dt", consumption: 12 },
  { id: "lc200p", group: "Суудлын машин", name: "Toyota Land Cruiser 200 бензин", fuel: "ai95", consumption: 15 },
  { id: "lx570", group: "Суудлын машин", name: "Lexus LX 570", fuel: "ai95", consumption: 17 }
];

/** One choice in the calculator: a menu card with what it is compared to. */
export type CalcModel = {
  value: string; // "slug|variant"
  slug: string;
  name: string;
  category: string;
  fuel: FuelType;
  evConsumption: number;
  /** Battery-only range for EREV/PHEV, km. */
  evRangeKm?: number;
  compare: { name: string; fuel: FuelCode; consumption: number };
};

export type SavingsInput = {
  model: CalcModel;
  compareFuel: FuelCode;
  compareConsumption: number;
  kmPerDay: number;
  daysPerMonth: number;
  price: number;
  downPercent: number;
  months: number;
  income: IncomeType;
};

export type SavingsResult = {
  monthlyKm: number;
  fuelCost: number; // the similar combustion vehicle, per month
  electricityCost: number;
  extenderFuelCost: number; // EREV/PHEV petrol beyond the battery range
  evCost: number;
  saving: number; // per month
  serviceSaving: number; // per year
  loan: LoanResult | null;
  /** Loan payment + running cost of the Ruichi, per month. */
  ownCost: number | null;
  /** Share of the loan payment the fuel saving covers, 0–1+. */
  coverage: number | null;
};

export function calculateSavings(input: SavingsInput, prices: Record<FuelCode, number>): SavingsResult {
  const { model, kmPerDay, daysPerMonth } = input;
  const monthlyKm = Math.max(0, kmPerDay) * Math.max(0, daysPerMonth);
  const fuelCost = (monthlyKm * input.compareConsumption) / 100 * prices[input.compareFuel];

  // EREV/PHEV run on the battery up to its range each day, then on petrol.
  const electricKmPerDay = model.fuel !== "BEV" && model.evRangeKm ? Math.min(kmPerDay, model.evRangeKm) : kmPerDay;
  const petrolKmPerDay = Math.max(0, kmPerDay - electricKmPerDay);
  const electricityCost = (electricKmPerDay * daysPerMonth * model.evConsumption) / 100 * ELECTRICITY_PRICE;
  const extenderFuelCost = (petrolKmPerDay * daysPerMonth * EXTENDER_FUEL_USE) / 100 * prices.euro92;
  const evCost = electricityCost + extenderFuelCost;
  const saving = fuelCost - evCost;

  const loan = input.price > 0
    ? calculateLoan({ price: input.price, downPercent: input.downPercent, months: input.months, income: input.income, realEstate: false })
    : null;
  return {
    monthlyKm, fuelCost, electricityCost, extenderFuelCost, evCost, saving,
    serviceSaving: monthlyKm * 12 * SERVICE_SAVING_PER_KM,
    loan,
    ownCost: loan ? loan.monthly + evCost : null,
    coverage: loan && loan.monthly > 0 ? Math.max(0, saving) / loan.monthly : null
  };
}

export const SAVINGS_STORAGE_KEY = "savingsVehicle";
/** What "Бонус авах" carries to /register/. */
export type SavedVehicle = { model: string; compare: string; consumption: string; distance: string };
