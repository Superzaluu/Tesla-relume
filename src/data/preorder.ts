// Shared by the /preorder/ form, its server action and /admin/preorders/.

export const PAYMENTS = [
  { value: "cash", label: "Бэлэн" },
  { value: "green_loan", label: "Ногоон зээл" },
  { value: "leasing", label: "Лизинг" }
] as const;
export type Payment = (typeof PAYMENTS)[number]["value"];

export const PREORDER_STATUSES = [
  { value: "new", label: "Шинэ" },
  { value: "contacted", label: "Холбогдсон" },
  { value: "closed", label: "Хаасан" }
] as const;
export type PreorderStatus = (typeof PREORDER_STATUSES)[number]["value"];

export type PreorderRow = {
  id: string; created_at: string; model_slug: string; model_name: string; variant: "cargo" | "passenger" | null;
  name: string; phone: string; payment: Payment; note: string | null; status: PreorderStatus;
  /** "green_loan" rows come from the /green-loan/ calculator and carry its values. */
  source: "preorder" | "green_loan"; income_type: "salary" | "business" | null;
  vehicle_price: number | null; down_payment: number | null; term_months: number | null; monthly_payment: number | null;
};

/** One choice in the model list: a menu card (model + variant). */
export type PreorderModel = { value: string; name: string; desc: string; category: string; thumb: string };

export const preorderModelValue = (slug: string, variant?: string | null) => `${slug}|${variant ?? ""}`;
