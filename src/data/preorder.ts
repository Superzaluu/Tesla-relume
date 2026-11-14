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

/** Online deposit through Byl: none (no deposit), pending (checkout open), verifying (bank transfer reported), paid, expired. */
export const DEPOSIT_STATUSES = [
  { value: "none", label: "Урьдчилгаагүй" },
  { value: "pending", label: "Төлбөр хүлээж буй" },
  { value: "verifying", label: "Шилжүүлэг шалгагдаж буй" },
  { value: "paid", label: "Урьдчилгаа төлсөн" },
  { value: "expired", label: "Хугацаа дууссан" }
] as const;
export type DepositStatus = (typeof DEPOSIT_STATUSES)[number]["value"];

/** Days within which a cancelled pre-order's deposit is refunded (shown on the form and in /legal/terms/). */
export const DEPOSIT_REFUND_DAYS = 2;

export type PreorderRow = {
  id: string; created_at: string; model_slug: string; model_name: string; variant: "cargo" | "passenger" | null;
  name: string; last_name: string | null; phone: string; email: string | null; facebook: string | null;
  payment: Payment; note: string | null; status: PreorderStatus;
  /** "green_loan" rows come from the /green-loan/ calculator and carry its values. */
  source: "preorder" | "green_loan"; income_type: "salary" | "business" | null;
  vehicle_price: number | null; down_payment: number | null; term_months: number | null; monthly_payment: number | null;
  payment_status: DepositStatus; deposit_amount: number | null; byl_checkout_id: number | null; byl_checkout_url: string | null;
  paid_amount: number | null; paid_at: string | null;
};

/** One choice in the model list: a menu card (model + variant); deposit = online deposit in MNT, if any. */
export type PreorderModel = { value: string; name: string; desc: string; category: string; thumb: string; deposit?: number };

export const preorderModelValue = (slug: string, variant?: string | null) => `${slug}|${variant ?? ""}`;
