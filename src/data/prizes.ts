// «Азын хүрд» after a pre-order (user test #1, 2026-11-23, item 8). Every spin wins one of these (no empty
// slot: a draw with blanks would count as a lottery). The prize is handed over when the vehicle is delivered.
// `weight`: relative chance (they do not need to add up to 100). Change them here; the server picks the prize.
export type Prize = { key: string; label: string; short: string; weight: number };

export const PRIZES: Prize[] = [
  { key: "cash50", label: "50,000 ₮-ийн хөнгөлөлт", short: "50,000 ₮", weight: 40 },
  { key: "polish", label: "Машин өнгөлөгч", short: "Өнгөлөгч", weight: 30 },
  { key: "keys", label: "Ком түлхүүр", short: "Ком түлхүүр", weight: 20 },
  { key: "cash100", label: "100,000 ₮-ийн хөнгөлөлт", short: "100,000 ₮", weight: 10 }
];

/** The wheel's 8 slots: each prize twice, alternating so neighbours differ. */
export const WHEEL = ["cash50", "polish", "keys", "cash100", "cash50", "polish", "keys", "cash100"];

export const prizeByKey = (key: string) => PRIZES.find((prize) => prize.key === key);

/** E-mail / Facebook bonus line under those fields on the pre-order form (user test #1, item 8). */
export const CONTACT_BONUS = {
  email: "И-мэйл хаягаа бүртгүүлбэл захиалгын дараа азын хүрд эргүүлж бонус бэлэг хожно.",
  facebook: "Facebook хаягаа нэмбэл нэмэлт бонус бэлэг авна."
};
