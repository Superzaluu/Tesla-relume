// The maker's name in front of every model name (user test #1, 2026-11-23, item 11: visitors did not know what
// kind of vehicle "C5" or "EC75" is). Names stay plain in Supabase and in sentences; only display spots that
// show a model name on its own (hero title, menu cards, model cards, pre-order) put «Ruichi» before it.
export const BRAND = "Ruichi";

/** "C5" → "Ruichi C5"; a name that already starts with the brand is left as it is. */
export const brandName = (name: string) => (name.trim().toLowerCase().startsWith(BRAND.toLowerCase()) ? name : `${BRAND} ${name}`);

/**
 * «Брэндийн тухай» page (/brand/). Facts checked on 2026-11-23 against Seres Group's About page, Baidu Baike's
 * entry for Chongqing Ruichi Automobile Industrial Co., Ltd. and Sohu Auto. Keep claims to what those say.
 */
export const BRAND_FACTS = [
  { value: "2003", label: "онд үүсгэн байгуулагдсан", text: "Хятадын Чунцин хотын Ляңжян шинэ бүсэд төвтэй." },
  { value: "Seres", label: "группийн охин компани", text: "Seres групп 2024 онд 426,900 шинэ эрчим хүчний машин борлуулсан." },
  { value: "Анхны", label: "цахилгаан арилжааны машины эрхтэй", text: "Цэвэр цахилгаан арилжааны машин үйлдвэрлэх улсын эрх авсан анхны үйлдвэрүүдийн нэг." },
  { value: "Тэргүүлэгч", label: "цахилгаан ачааны машинд", text: "Хятадын шинэ эрчим хүчний логистикийн машины зах зээлд борлуулалтаар тэргүүлэгчдийн нэг." }
];

export const BRAND_TIMELINE = [
  { year: "2003", title: "Үүсгэн байгуулагдсан", text: "2003 оны 9-р сарын 27-нд Чунцин хотод байгуулагдаж, шинэ эрчим хүчний арилжааны машинд төвлөрсөн." },
  { year: "Эхний үе", title: "Улсын үйлдвэрлэлийн эрх", text: "Цэвэр цахилгаан арилжааны машин үйлдвэрлэх улсын эрхийг анхлан авсан үйлдвэрүүдийн нэг болсон." },
  { year: "ED71", title: "Цахилгаан бичил ачааны машин", text: "Цэвэр цахилгаан бичил ачааны машиныг анхлан гаргасан үйлдвэрүүдийн нэг." },
  { year: "2021 оноос", title: "EC35II — борлуулалтын тэргүүн эгнээнд", text: "EC35II нь шинэ эрчим хүчний логистикийн фургоны борлуулалтын жагсаалтын тэргүүн эгнээнд олон жил байна." },
  { year: "Өнөөдөр", title: "Бүрэн шугам", text: "Бичил, дунд, том фургон, ачааны машин, хөргүүртэй болон тусгай зориулалтын загварууд." }
];

export const BRAND_PILLARS = [
  { title: "Арилжааны машинд төвлөрсөн", text: "Ruichi зөвхөн ажлын машин хийдэг: түгээлт, ачаа тээвэр, үйлчилгээ, зорчигч тээвэр." },
  { title: "Хүйтэнд туршсан", text: "Загварууд нь −30°C-ийн өвлийн туршилтад орж, батерей халаах системтэй." },
  { title: "Дилерийн баталгаа", text: "Монголд 6 жил эсвэл 300,000 км-ийн баталгаатай, засвар үйлчилгээ орон нутагтаа." }
];

/** Sources shown in small print under the page. */
export const BRAND_SOURCES = [
  { label: "Seres Group — About", href: "https://seres.cn/EnAbout.html" },
  { label: "Baidu Baike — Chongqing Ruichi Automobile Industrial Co., Ltd.", href: "https://baike.baidu.com/en/item/Chongqing%20Ruichi%20Automobile%20Industrial%20Co.,%20Ltd./39799" },
  { label: "Wikipedia — Seres Group", href: "https://en.wikipedia.org/wiki/Seres_Group" }
];
