// Khan Bank "Ногоон тээврийн хэрэгслийн зээл" (new vehicle) terms, used by the /green-loan/
// calculator, its server action and /admin/preorders/. Taken from the bank's product page on
// 2026-11-14 — when the bank changes its terms, update them here (and CHECKED_ON).

export const GREEN_LOAN_SOURCE =
  "https://www.khanbank.com/personal/product/detail/personal-green-loan-green-vehicle-loan/#section1925";
export const GREEN_LOAN_CHECKED_ON = "2026-11-14";

export type IncomeType = "salary" | "business";
export const INCOME_TYPES: { value: IncomeType; label: string; hint: string }[] = [
  { value: "salary", label: "Цалингийн орлого", hint: "60 сар хүртэл" },
  { value: "business", label: "Бизнесийн орлого", hint: "96 сар хүртэл" }
];

/** Rate tiers: monthly interest (%) by income type and term. */
export const RATE_TIERS = [
  { income: "salary", maxMonths: 30, monthly: 1.35, annual: 16.2, label: "Цалингийн орлого, 30 сар хүртэл" },
  { income: "salary", maxMonths: 60, monthly: 1.4, annual: 16.8, label: "Цалингийн орлого, 31–60 сар" },
  { income: "business", maxMonths: 96, monthly: 1.3, annual: 15.6, label: "Бизнесийн орлого, 96 сар хүртэл" }
] as const;

export const MAX_TERM: Record<IncomeType, number> = { salary: 60, business: 96 };
export const MIN_TERM = 6;
export const MIN_DOWN_PERCENT = 10; // 0% only with additional real-estate collateral
export const SERVICE_FEE_RATE = 0.005;
export const SERVICE_FEE_CAP = 500_000;
export const REAL_ESTATE_ABOVE = 150_000_000; // loans above this need real estate as extra collateral
export const THIRD_PARTY_FEES = [
  { label: "Зээлийн мэдээллийн сангийн лавлагаа", amount: 1_000 },
  { label: "Хөдлөх хөрөнгийн барьцааны бүртгэл", amount: 20_000 }
];

export const REQUIREMENTS = [
  "ХААН Банктай хамтран ажиллах гэрээтэй нийлүүлэгчээс тээврийн хэрэгсэл худалдан авах",
  "Цалингийн орлоготой бол тухайн байгууллагад сүүлийн 6-аас доошгүй сар ажиллаж байгаа, бизнесийн орлоготой бол сүүлийн 6-аас доошгүй сар тогтвортой бизнес эрхэлж байгаа",
  "Банкны санхүүгийн харьцааны шалгуурыг хангасан байх",
  "Хугацаа хэтэрсэн зээлийн өрийн үлдэгдэлгүй байх",
  "Зээл төлөгдөх хүртэл тээврийн хэрэгслийг банкны хүлээн зөвшөөрсөн даатгалд хамруулах"
];

export const DOCUMENTS = [
  "Иргэний үнэмлэх (эх хувь эсвэл нотариатаар баталсан хуулбар), хамтран үүрэг гүйцэтгэгчийнх мөн",
  "Цалингийн орлоготой бол нийгмийн даатгалын лавлагаа",
  "Бизнесийн орлоготой бол санхүүгийн болон үйл ажиллагааг тодорхойлох баримт",
  "Бусад банк, ББСБ-д зээлтэй бол тухайн зээлийн гэрээ",
  "Тээврийн хэрэгслийн үнийн нэхэмжлэх ба нийлүүлэгчийн нэр дээрх гаалийн мэдүүлгийн хуулбар (нийлүүлэгч бэлтгэнэ)"
];

export const rateFor = (income: IncomeType, months: number) =>
  RATE_TIERS.find((tier) => tier.income === income && months <= tier.maxMonths) ?? RATE_TIERS[RATE_TIERS.length - 1];

export type LoanInput = { price: number; downPercent: number; months: number; income: IncomeType; realEstate: boolean };
export type LoanResult = {
  downPayment: number; loan: number; monthly: number; totalInterest: number; totalPaid: number; serviceFee: number;
  rate: (typeof RATE_TIERS)[number]; needsRealEstate: boolean;
};

/** Equal monthly instalments (annuity). An estimate: the bank's schedule may differ slightly. */
export function calculateLoan({ price, downPercent, months, income, realEstate }: LoanInput): LoanResult {
  const minDown = realEstate ? 0 : MIN_DOWN_PERCENT;
  const down = Math.round(price * Math.min(100, Math.max(minDown, downPercent)) / 100);
  const loan = Math.max(0, price - down);
  const term = Math.min(MAX_TERM[income], Math.max(1, Math.round(months)));
  const rate = rateFor(income, term);
  const r = rate.monthly / 100;
  const monthly = loan === 0 ? 0 : Math.round((loan * r) / (1 - Math.pow(1 + r, -term)));
  const totalPaid = monthly * term;
  return {
    downPayment: down, loan, monthly, totalPaid, totalInterest: Math.max(0, totalPaid - loan),
    serviceFee: Math.min(SERVICE_FEE_CAP, Math.round(loan * SERVICE_FEE_RATE)),
    rate, needsRealEstate: loan > REAL_ESTATE_ABOVE
  };
}

export const tugrik = (value: number) => `${new Intl.NumberFormat("en-US").format(Math.round(value))} ₮`;
