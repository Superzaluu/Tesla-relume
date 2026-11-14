// Structured technical specs ("үзүүлэлтийн хуудас").
//
// Every model uses the same fixed list of rows (FIELDS). Admins only type values, one per
// configuration, so labels and units never drift. The page then derives, as on the R5 page:
//  - summary blocks (Хэмжээ, Хүч, Зай ба цэнэглэлт…) with ranges across configurations,
//  - a comparison table with only the rows that differ between configurations,
//  - "Бүх хувилбарт стандартаар" chips for equipment every configuration has,
//  - a collapsed full table.
//
// Old free-form tables (models.spec, string[][]) are converted on the fly by fromLegacy().
// This file has no imports so scripts can load it directly with node --experimental-strip-types.

export type Part = "core" | "equipment";
export type FieldKind = "number" | "text" | "dims" | "mark" | "select";

export type Group = { key: string; label: string; part: Part; fuelOnly?: boolean };
export type Field = {
  key: string;
  label: string;
  group: string;
  kind: FieldKind;
  unit?: string;
  /** Old labels (from the imported tables) that mean this field. Compared after normalizeLabel(). */
  aliases?: string[];
  options?: string[];
  /** Normal range for numbers; values outside only warn. */
  range?: [number, number];
  /** Shown in the summary blocks at the top of the section. */
  summary?: boolean;
  /** Dealer minimum: a configuration for sale without it gets a warning in admin. */
  required?: boolean;
  /** Dealer rule: a configuration without it ("●") is never shown on the site. */
  mustHave?: boolean;
  /** Short name used when equipment rows are merged in the comparison table. */
  short?: string;
  /** One-line selling point; standard items with a pitch become the highlight list. */
  pitch?: string;
  /** Imported but never shown on the site (China-only items such as ETC toll tags). */
  hidden?: boolean;
};

/** price: dealer price in ₮; missing → "Үнэ лавлах". */
export type SpecConfig = { name: string; sold: boolean; price?: number };
export type ExtraRow = { group: string; label: string; values: string[] };
export type SpecSheet = {
  configs: SpecConfig[];
  /** Field key → one value per configuration ("" = not given). Marks are "●", "○", "–" (+ optional note). */
  values: Record<string, string[]>;
  extras: ExtraRow[];
  /** Field keys whose imported columns did not line up with the configurations. */
  check?: string[];
  /** True while the sheet is only a conversion of the old table (never saved from the form). */
  converted?: boolean;
  /** Where the values were imported from, e.g. "Google Sheet «Ruichi specs» · C5 REEV · 2026-11-14". */
  source?: string;
};

/** "Задгай: 5990×1880×2030 · Битүү: 5950×1880×2635" → [["Задгай", "5990×…"], ["Битүү", "5950×…"]]; plain values give [["", value]]. */
export function bodyParts(value: string): [string, string][] {
  if (!value.includes(": ")) return [["", value]];
  const parts = value.split(" · ").map((part): [string, string] => {
    const at = part.indexOf(": ");
    return at > 0 ? [part.slice(0, at), part.slice(at + 2)] : ["", part];
  });
  // Only body types count as labels; "Атираат: 3600×…" is part of the value.
  const isBody = (label: string) => label.split(/,\s*/).every((name) => BODY_TYPES.includes(name.toLowerCase()));
  return parts.every(([label]) => label && isBody(label)) ? parts : [["", value]];
}
const BODY_TYPES = ["задгай", "торон хаалттай", "битүү"];

export const DEALER_WARRANTY = "6 жил / 300,000 км";

export const GROUPS: Group[] = [
  { key: "general", label: "Ерөнхий", part: "core" },
  { key: "dims", label: "Хэмжээ ба жин", part: "core" },
  { key: "motor", label: "Мотор", part: "core" },
  { key: "battery", label: "Зай ба цэнэглэлт", part: "core" },
  { key: "extender", label: "Зай сунгагч", part: "core", fuelOnly: true },
  { key: "chassis", label: "Явах эд анги", part: "equipment" },
  { key: "safety", label: "Аюулгүй байдал", part: "equipment" },
  { key: "comfort", label: "Тохилог ба ухаалаг", part: "equipment" },
  { key: "lights", label: "Гэрэлтүүлэг", part: "equipment" },
  { key: "colors", label: "Өнгө", part: "equipment" }
];

const f = (group: string, key: string, label: string, kind: FieldKind, rest: Partial<Field> = {}): Field => ({ key, label, group, kind, ...rest });
const mark = (group: string, key: string, label: string, aliases: string[], rest: Partial<Field> = {}) => f(group, key, label, "mark", { aliases, ...rest });

export const FIELDS: Field[] = [
  // ---- Ерөнхий
  f("general", "energy", "Эрчим хүчний төрөл", "text", { aliases: ["эрчим хүчний төрөл", "түлшний хэлбэр"] }),
  f("general", "cabin", "Кабин", "text", { aliases: ["жолоочийн бүхээг"], options: ["Нэг эгнээ", "Давхар эгнээ", "Өндөр дээвэртэй"] }),
  f("general", "code", "Загварын код", "text", { aliases: ["бүтээгдэхүүний загвар", "зарын загвар"] }),
  f("general", "body", "Биеийн бүтэц", "text", { aliases: ["биеийн бүтэц", "кузовын хийц", "машины биеийн бүтэц"] }),
  f("general", "seats", "Суудлын тоо", "number", { aliases: ["суудлын тоо", "зөвшөөрөгдсөн зорчигчдын тоо"], range: [1, 20] }),
  f("general", "seat_layout", "Суудлын байрлал", "text", { aliases: ["суудлын зохион байгуулалт"] }),
  f("general", "doors", "Хаалганы тоо", "number", { aliases: ["хаалганы тоо"], range: [2, 6] }),

  // ---- Хэмжээ ба жин
  f("dims", "size", "Урт × өргөн × өндөр", "dims", { unit: "мм", aliases: ["ерөнхий хэмжээс", "урт×өргөн×өндөр"], summary: true }),
  f("dims", "wheelbase", "Тэнхлэг хоорондын зай", "number", { unit: "мм", aliases: ["тэнхлэг хоорондын зай"], range: [2000, 5000], summary: true }),
  f("dims", "track", "Урд / хойд мөр", "text", { unit: "мм", aliases: ["урд/арын тэнхлэг хоорондын зай", "урд болон хойд тэнхлэг хоорондын зай"] }),
  f("dims", "cargo_size", "Тэвш / ачааны хайрцаг", "text", { unit: "мм", aliases: ["тэвшний хэмжээ"], summary: true }),
  f("dims", "cargo_volume", "Ачааны багтаамж", "number", { unit: "м³", aliases: ["ачааны хайрцаг ачааны хэмжээ", "ачааны хэмжээ", "контейнер ачааны хэмжээ"], range: [1, 40], summary: true }),
  f("dims", "curb_weight", "Өөрийн жин", "number", { unit: "кг", aliases: ["өөрийн жин"], range: [700, 6000] }),
  f("dims", "gross_weight", "Нийт жин", "number", { unit: "кг", aliases: ["нийт масс", "нийт жин"], range: [1200, 9000] }),
  f("dims", "payload", "Даац", "number", { unit: "кг", aliases: ["ачааллын нэрлэсэн жин", "даац"], range: [200, 6000], summary: true }),
  f("dims", "approach", "Ойртох / хөдлөх өнцөг", "text", { unit: "°", aliases: ["ойртох өнцөг"] }),
  f("dims", "rear_door", "Арын хаалга", "text", { aliases: ["арын хаалга онгойлгох хэлбэр", "ачааны хаалга нээх маягт", "ачааны хаалгыг нээх горим"] }),
  f("dims", "cargo_floor", "Ачааны шал", "text", { aliases: ["ачааны шал", "ачааны тасалгааны шал"] }),

  // ---- Мотор
  f("motor", "motor_type", "Моторын төрөл", "text", { aliases: ["моторын төрөл", "мотор төрөл", "мотор"], summary: true }),
  f("motor", "motor_layout", "Моторын байрлал", "select", { aliases: ["моторын зохион байгуулалт"], options: ["Урд", "Арын"] }),
  f("motor", "drive", "Хөтлөгч", "select", { aliases: ["хөтлөгчийн төрөл", "хөтлөгчийн хэлбэр", "жолооны горим"], options: ["FWD", "RWD", "AWD"], summary: true }),
  f("motor", "power", "Моторын хүч", "number", { unit: "кВт", aliases: ["оргил хүч", "хамгийн их хүч", "моторын нийт хүч", "хамгийн их цэвэр хүч"], range: [20, 300], summary: true }),
  f("motor", "torque", "Эргэх момент", "number", { unit: "Н·м", aliases: ["оргил эргэлт", "хамгийн их эргэлт", "хөдөлгүүрийн нийт эргэлт", "хамгийн их цэвэр эргэлт"], range: [50, 1000], summary: true }),
  f("motor", "top_speed", "Дээд хурд", "number", { unit: "км/ц", aliases: ["хамгийн дээд хурд", "хамгийн их хурд"], range: [50, 200], summary: true }),
  f("motor", "gear_ratio", "Хурдны харьцаа", "number", { aliases: ["дамжуулах тэнхлэгийн хурдны харьцаа"], range: [3, 20] }),

  // ---- Зай ба цэнэглэлт
  f("battery", "battery_type", "Батерейн төрөл", "text", { aliases: ["зайны төрөл", "цахилгаан батерей"], options: ["LFP (лити төмрийн фосфат)"], summary: true }),
  f("battery", "battery_kwh", "Батерейн багтаамж", "number", { unit: "кВт·ц", aliases: ["зайны хүчин чадал", "зайны багтаамж"], range: [10, 150], summary: true }),
  f("battery", "range", "Туулах зай", "number", {
    unit: "км", range: [50, 800], summary: true,
    aliases: ["cltc цэвэр цахилгаан явах зай", "цэнэглэлтийн зай", "үйл ажиллагааны миль", "cltc аялалын хүрээ", "nedc цэвэр цахилгаан явах зай", "wltc цэвэр цахилгаан явах зай", "chtc-lt ажлын явах зай"]
  }),
  f("battery", "range_std", "Туулах зайн стандарт", "select", { options: ["CLTC", "NEDC", "WLTC", "CHTC"] }),
  f("battery", "consumption", "Эрчим хүчний зарцуулалт", "number", { unit: "кВт·ц/100км", aliases: ["cltc эрчим хүчний хэрэглээ", "nedc жигнэсэн иж бүрэн эрчим хүчний хэрэглээ"], range: [8, 40] }),
  f("battery", "dc_time", "Хурдан цэнэглэлт 20–80%", "number", { unit: "мин", aliases: ["20%80% хурдан цэнэглэх хугацаа", "0%80% хурдан цэнэглэх хугацаа"], range: [10, 120], summary: true }),
  f("battery", "ac_time", "Удаан цэнэглэлт", "number", { unit: "цаг", aliases: ["20%100% удаан цэнэглэх хугацаа", "0%100% удаан цэнэглэх хугацаа"], range: [2, 20] }),
  f("battery", "ac_power", "Удаан цэнэглэх чадал", "number", { unit: "кВт", aliases: ["удаан цэнэглэх хүч", "машинд суурилуулсан хувьсах гүйдлийн цэнэглэлт"], range: [1, 22] }),
  mark("battery", "dc", "Хурдан (DC) цэнэглэлт", ["хурдан цэнэглэх функц", "dc хурдан цэнэглэгч"], { short: "DC цэнэглэлт" }),
  f("battery", "charge_rate", "Цэнэглэх хурд", "text", { aliases: ["хурдан цэнэглэх хурд", "хурдан цэнэглэх төрөл", "цэнэглэх хурд", "цэнэглэх төрөл"] }),
  f("battery", "battery_cooling", "Батерейн хөргөлт", "text", { aliases: ["зай хөргөх хэлбэр"], options: ["Шингэн хөргөлт", "Агаар хөргөлт"] }),
  mark("battery", "battery_heating", "Батерей халаах", ["батерейг халаах функц", "зайны системийн дулааны удирдлага"], { pitch: "Хүйтэнд батерейг халааж, цэнэглэлт болон зайг хадгална." }),
  mark("battery", "v2l", "V2L — гадагш цахилгаан өгөх", ["v2l", "v2l гадаад цэнэгийн функц"], { short: "V2L", pitch: "Машины зайгаас гадны багаж, төхөөрөмжөө тэжээнэ." }),

  // ---- Зай сунгагч (EREV / PHEV / CNG)
  f("extender", "engine_model", "Зай сунгагч", "text", { aliases: ["хамрах хүрээ өргөтгөгч", "хөдөлгүүр", "хөдөлгүүрийн загвар"], summary: true }),
  f("extender", "displacement", "Хөдөлгүүрийн багтаамж", "number", { unit: "л", aliases: ["шилжилт"], range: [0.5, 3] }),
  f("extender", "tank", "Сав", "number", { unit: "л", aliases: ["шатахууны сав", "хийн хадгалах сав"], range: [10, 400], summary: true }),
  f("extender", "total_range", "Нийт туулах зай", "number", { unit: "км", aliases: ["nedc аялалын нийт хүрээ"], range: [200, 2000], summary: true }),
  f("extender", "fuel_use", "Түлшний зарцуулалт", "number", {
    unit: "л/100км", range: [2, 20],
    aliases: ["nedc жигнэсэн иж бүрэн түлшний зарцуулалт", "nedc жигнэсэн нийлмэл түлшний зарцуулалт", "nedc түлшний зарцуулалтын хамгийн бага төлөв", "nedc хамгийн бага түлшний зарцуулалт", "wltc хамгийн бага төлсөн хийн хэрэглээ"]
  }),
  f("extender", "emission", "Ялгарлын стандарт", "text", { aliases: ["ялгарлын стандарт"] }),

  // ---- Явах эд анги
  f("chassis", "front_susp", "Урд түдгэлзүүр", "text", { aliases: ["урд түдгэлзүүлэлтийн төрөл", "урд болон хойд түдгэлзүүлэлтийн төрлүүд"], summary: true }),
  f("chassis", "rear_susp", "Хойд түдгэлзүүр", "text", { aliases: ["арын түдгэлзүүлэлтийн төрөл"], summary: true }),
  f("chassis", "steering", "Жолооны хүч өгөгч", "text", { aliases: ["удирдах систем", "туслах төрөл"], options: ["EPS (цахилгаан)", "C-EPS"], required: true, summary: true }),
  f("chassis", "brakes", "Тоормос", "text", { aliases: ["тоормосны хэлбэр", "тоормосны төрөл", "урд тоормосны төрлүүд"], summary: true }),
  f("chassis", "parking_brake", "Зогсоолын тоормос", "text", { aliases: ["зогсоолын тоормосны төрөл"] }),
  f("chassis", "tyres", "Дугуй", "text", { aliases: ["дугуйн техникийн үзүүлэлтүүд", "дугуй", "урд дугуйны техникийн үзүүлэлтүүд"], summary: true }),
  f("chassis", "rims", "Обуд", "text", { aliases: ["обуд"], options: ["Ган обуд", "Хайлшин обуд"] }),
  mark("chassis", "spare", "Запас дугуй", ["запас дугуй"]),
  mark("chassis", "regen", "Энерги сэргээх тоормос", ["тоормосны энергийн санал хүсэлт", "тоормосны энергийн хариу", "гулсах энергийн санал хүсэлт"], { pitch: "Тоормослох, налууд уруудах үед батерейгаа цэнэглэнэ." }),

  // ---- Аюулгүй байдал
  mark("safety", "abs", "ABS + EBD", ["abs+ebd", "abs цоожны эсрэг", "түгжихээс хамгаалах тоормосны систем", "тоормосны хүчний хуваарилалт"], { required: true }),
  mark("safety", "esc", "Тогтвортой байдлын систем (ESC)", ["биеийн тогтвортой байдлын систем", "биеийн электрон тогтвортой байдлын систем", "цахим тогтвортой байдлын систем"], { short: "ESC", pitch: "Огцом эргэлт, хальтиргаатай замд гулгахаас сэргийлнэ." }),
  mark("safety", "tcs", "Зүтгүүрийн хяналт (TCS)", ["зүтгүүрийн хяналт"], { short: "TCS" }),
  mark("safety", "hill", "Ууланд хөдлөх туслах", ["ууланд өгсөх тусламж", "ууланд эхлэхэд туслах"]),
  mark("safety", "autohold", "Автомат зогсоол (AUTO HOLD)", ["auto hold", "автомат зогсоол"], { short: "AUTO HOLD", pitch: "Гэрлэн дохион дээр тоормос дарахгүйгээр зогсож байна." }),
  mark("safety", "tpms", "Дугуйн даралтын хяналт (TPMS)", ["дугуйн даралтын хяналт"], { short: "TPMS", pitch: "Дугуй бүрийн даралтыг бодит цагт хянана." }),
  f("safety", "airbags", "Агаарын дэр", "text", { aliases: ["агаарын дэр", "жолоочийн аюулгүйн дэр"] }),
  mark("safety", "rear_camera", "Арын камер", ["буцах зураг", "урвуу видео"], { required: true, mustHave: true }),
  mark("safety", "camera360", "360° камер", ["360° панорам зураг"], { short: "360° камер", pitch: "Машиныг тойрсон орчныг дээрээс нь харж, давчуу газар амархан зогсооно." }),
  mark("safety", "radar", "Зогсоолын радар", ["зогсоолын радар", "жолоодох/ухрах радар", "зогсоолын мэдрэгч", "ухрах радар"]),
  mark("safety", "aeb", "Яаралтай автомат тоормос (AEB)", ["идэвхтэй тоормос", "автомат яаралтай тоормос"], { short: "AEB", pitch: "Мөргөлдөх эрсдэлтэй үед машин өөрөө тоормослоно." }),
  mark("safety", "fcw", "Мөргөлдөх анхааруулга (FCW)", ["урагш мөргөлдөх анхааруулга"], { short: "FCW" }),
  mark("safety", "ldw", "Эгнээнээс гарах анхааруулга (LDW)", ["замаас гарах анхааруулга"], { short: "LDW" }),
  mark("safety", "ldp", "Эгнээ хадгалах туслах (LDP)", ["замаас гарахаас урьдчилан сэргийлэх", "эгнээнээс гарахыг дарах"], { short: "LDP" }),
  mark("safety", "acc", "Дасан зохицох круиз (ACC)", ["дасан зохицох cruise control"], { short: "ACC", pitch: "Урд машиныг автоматаар дагаж, хурд болон зайгаа барина." }),
  mark("safety", "ica", "Нэгдсэн круиз (TJA/ICA)", ["нэгдсэн аялал"], { short: "ICA" }),
  mark("safety", "isa", "Хурд хязгаарлах туслах (ISA)", ["ухаалаг хурд хязгаарлах туслах"], { short: "ISA" }),
  mark("safety", "dms", "Жолоочийн ядаргааны хяналт (DMS)", ["жолоочийн хяналтын систем"], { short: "DMS" }),
  mark("safety", "edr", "Осол бүртгэгч (EDR)", ["үйл явдлын мэдээлэл бүртгэх систем"], { short: "EDR" }),
  mark("safety", "pedestrian", "Явган зорчигчид өгөх дуут дохио", ["бага хурдтай явган хүний санамж"]),
  mark("safety", "brake_alert", "Яаралтай тоормосны дохио", ["яаралтай тоормосны дохиолол"]),
  mark("safety", "belt_alert", "Суудлын бүсний сануулга", ["суудлын бүс зүүгээгүй сануулга", "суудлын бүс зүүсэн сануулагч төхөөрөмж"]),
  mark("safety", "crash_cutoff", "Мөргөлдөхөд цахилгаан тасалгах", ["мөргөлдөөнөөс хамгаалах хамгаалалт", "өндөр хүчдэлийн аюулгүй байдлын хяналт"]),
  mark("safety", "isofix", "Хүүхдийн суудлын бэхэлгээ (ISOFIX)", ["хүүхдийн суудлын интерфейс"], { short: "ISOFIX" }),
  mark("safety", "charge_lock", "Цэнэглэх үеийн түгжээ", ["цэнэглэх түгжээ", "цэнэглэдэг электрон цоож"]),
  mark("safety", "central_lock", "Төв түгжээ, алсын түлхүүр", ["төв түгжээ+алсын удирдлагатай түлхүүр", "төв түгжээ+алсын удирдлагын түлхүүр", "машины төв түгжээ", "алсын түлхүүр"], { required: true }),

  // ---- Тохилог ба ухаалаг
  mark("comfort", "ac", "Агааржуулагч", ["агааржуулагч"], { required: true }),
  f("comfort", "ac_control", "Агааржуулагчийн удирдлага", "text", { aliases: ["агааржуулагчийн температурыг хянах арга", "агааржуулагчийн температурын хяналтын горим"] }),
  f("comfort", "cluster", "Багажны самбар", "text", { aliases: ["багажны кластер", "хосолсон хэрэгсэл", "багажны хослол"] }),
  f("comfort", "screen", "Төв дэлгэц, аудио", "text", { aliases: ["аудио-визуал систем", "автомашины аудио, видео систем", "аудио болон видео систем"] }),
  mark("comfort", "radio", "Радио, MP3", ["mp3", "радио", "радио (mp3-тэй)"]),
  mark("comfort", "bluetooth", "Bluetooth", ["bluetooth", "машины bluetooth утас"], { pitch: "Утсаа холбож дуудлага, хөгжмөө удирдана." }),
  f("comfort", "usb", "USB / Type-C", "text", { aliases: ["usb интерфейс", "type-c/usb интерфейс", "төрөл-c интерфейс", "type-c интерфейс", "usb/type-c интерфейс"] }),
  mark("comfort", "wireless", "Утасгүй цэнэглэгч", ["гар утас утасгүй цэнэглэгч"]),
  mark("comfort", "voice", "Дуут удирдлага", ["дуут удирдлага"]),
  mark("comfort", "ota", "Алсын шинэчлэлт (OTA)", ["алсын шинэчлэлт", "алсын ota", "зайнаас шинэчлэх"], { short: "OTA", pitch: "Програм хангамж утасгүй шинэчлэгдэнэ." }),
  mark("comfort", "app", "Апп-аар удирдах", ["гар утасны app", "app алсын удирдлага", "алсын хяналт", "алсын удирдлага"], { short: "Апп", pitch: "Утаснаасаа машинаа алсаас удирдана." }),
  mark("comfort", "connected", "Холбогдсон машин", ["тээврийн хэрэгслийн интернет"], { pitch: "Машины мэдээлэл үргэлж гарт тань." }),
  f("comfort", "start", "Асаалт", "text", { aliases: ["эхлэх маягт", "эхлэх горим"] }),
  f("comfort", "gear_selector", "Хурдны бариул", "text", { aliases: ["ээлжийн удирдлагын механизм"] }),
  f("comfort", "wipers", "Арчигч", "text", { aliases: ["арчигч"] }),
  f("comfort", "inner_mirror", "Дотор толь", "text", { aliases: ["дотор арын толь"] }),
  f("comfort", "outer_mirror", "Гадна толь", "text", { aliases: ["гадна арын толь"] }),
  mark("comfort", "mf_wheel", "Олон үйлдэлт жолооны хүрд", ["олон үйлдэлт жолооны хүрд"]),
  mark("comfort", "wheel_adjust", "Жолооны хүрдний тохируулга", ["жолооны хүрд нь дээш доош тохируулагддаг", "жолооны хүрд тохируулах боломжтой"]),
  mark("comfort", "cruise", "Круиз контрол", ["cruise control"]),
  f("comfort", "drive_modes", "Жолоодлогын горим", "text", { aliases: ["жолооны горимын сонголт", "эрчим хүчний горимын сонголт"] }),
  f("comfort", "seat_material", "Суудлын материал", "text", { aliases: ["суудлын материал"], options: ["Даавуу", "Арьс", "Арьс + даавуу"] }),
  f("comfort", "driver_seat", "Жолоочийн суудал", "text", { aliases: ["жолоочийн суудал тохируулах үндсэн маягт", "жолоочийн суудал", "жолоочийн суудал тохируулах маягт", "жолоочийн үндсэн суудал"] }),
  f("comfort", "passenger_seat", "Зорчигчийн суудал", "text", { aliases: ["зорчигчийн суудал", "зорчигчийн суудал тохируулах маягт"] }),
  f("comfort", "windows", "Цахилгаан цонх", "text", { aliases: ["цонх өргөх", "бүтэн машины шил", "бүхэл бүтэн машины шил", "бүрэн хаалганы шил", "хаалганы шил", "шилэн өргөгч", "урд/арын цахилгаан цонх"] }),
  f("comfort", "mirrors", "Гадна толины тохируулга", "text", { aliases: ["гадна арын толин тусгалыг тохируулах маягт"] }),
  f("comfort", "speakers", "Чанга яригч", "number", { aliases: ["илтгэгчид", "илтгэгч", "илтгэгчдийн тоо"], range: [1, 12] }),
  mark("comfort", "12v", "Ухаалаг 12V цэнэглэлт", ["ухаалаг 12v цэнэглэгч"], { pitch: "Туслах аккумляторыг автоматаар цэнэглэнэ." }),
  mark("comfort", "etc", "ETC төлбөр хураагч", ["etc", "цахим төлбөр хураах", "зогсолтгүй төлбөр хураах систем"], { hidden: true }),

  // ---- Гэрэлтүүлэг
  f("lights", "headlights", "Урд гэрэл", "text", { aliases: ["урд талын хосолсон гэрэл", "урд гэрэл", "урд хосолсон гэрэл"], options: ["Галоген", "LED"] }),
  mark("lights", "auto_lights", "Автомат гэрэл", ["гэрэл автоматаар асдаг"]),
  mark("lights", "hma", "Ухаалаг холын гэрэл (HMA)", ["ухаалаг холын болон бага туяа", "дасан зохицох урт ба бага туяа"], { short: "HMA" }),
  mark("lights", "drl", "Өдрийн гэрэл", ["өдрийн цагаар ажилладаг гэрэл"]),
  mark("lights", "fog", "Манангийн гэрэл", ["арын манангийн гэрэл", "урд талын манангийн гэрэл"]),
  mark("lights", "light_height", "Гэрлийн өндрийн тохируулга", ["гэрлийн өндрийг тохируулах боломжтой", "урд хосолсон гэрлийн өндрийн тохируулга"]),
  mark("lights", "brake_light", "Дээд зогсоох гэрэл", ["өндөрт суурилуулсан зогсолтын гэрэл", "өндөр суурилуулсан зогсоох гэрэл"]),
  mark("lights", "reading", "Унших гэрэл", ["урд унших гэрэл", "урд уншилтын гэрэл", "унших гэрэл (урд/дунд/арын)"]),
  f("lights", "cargo_light", "Ачааны тасалгааны гэрэл", "text", { aliases: ["ачааны тасалгааны гэрэлтүүлэг"] }),

  // ---- Өнгө
  f("colors", "color_ext", "Гадна өнгө", "text", { aliases: ["гадаад өнгө"] }),
  f("colors", "color_int", "Дотор өнгө", "text", { aliases: ["дотор өнгө"] })
];

export const FIELD = Object.fromEntries(FIELDS.map((field) => [field.key, field])) as Record<string, Field>;
export const groupFields = (group: string) => FIELDS.filter((field) => field.group === group);
export const needsExtender = (fuel?: string) => fuel !== undefined && fuel !== "BEV";

// ---------------------------------------------------------------- values

export const MARKS = ["●", "○", "–"] as const;
export const MARK_LABEL: Record<string, string> = { "●": "Стандарт", "○": "Нэмэлт сонголт", "–": "Байхгүй" };

/** Lower-case, drop units in brackets, invisible characters, spaces and punctuation. */
export function normalizeLabel(label: string) {
  return label.toLowerCase().replace(/[​-‍﻿]/g, "").replace(/\([^)]*\)/g, "").replace(/[^\p{L}\p{N}%°]+/gu, "");
}

const ALIAS = new Map<string, string>();
for (const field of FIELDS) for (const alias of field.aliases ?? []) ALIAS.set(normalizeLabel(alias), field.key);

/** "●", "○", "–" or "" from the many ways the imported tables wrote them; keeps a short note ("● LED"). */
export function normalizeMark(raw: string): string {
  const value = raw.replace(/[¥￥]\s*[\d,.]+/g, "").trim();
  if (!value) return "";
  const head = value.match(/^(●|○|—+|–+|-+|─+)\s*/);
  if (!head) return /^(дэмжлэг|тийм|байгаа|стандарт)/i.test(value) ? "●" : value;
  const sign = head[1].startsWith("●") ? "●" : head[1].startsWith("○") ? "○" : "–";
  const note = value.slice(head[0].length).replace(/^[(（]|[)）]$/g, "").trim();
  return note && sign !== "–" ? `${sign} ${note}` : sign;
}

export const markOf = (value: string) => (value.startsWith("●") ? "●" : value.startsWith("○") ? "○" : value.startsWith("–") ? "–" : "");

function cleanValue(field: Field | undefined, raw: string): string {
  let value = raw.replace(/[¥￥]\s*[\d,.]+/g, "").replace(/\s+/g, " ").trim();
  if (/^(—+|–+|-+|─+)$/.test(value)) value = "–";
  if (!field) return value;
  if (field.kind === "mark") return normalizeMark(value);
  if (field.kind === "dims") return value.replace(/\s*[x×*]\s*/gi, "×");
  if (field.key === "drive") {
    if (/бүх|4wd|awd/i.test(value)) return "AWD";
    if (/урд|fwd/i.test(value)) return "FWD";
    if (/ар|хойд|rwd/i.test(value)) return "RWD";
  }
  if (field.key === "motor_layout") return /урд/i.test(value) ? "Урд" : /ар|хойд/i.test(value) ? "Арын" : value;
  if (field.kind === "number") {
    // "18мин", "15л", "6.5 цаг" → number only; keeps ranges such as "1080/1055" or "70–100".
    const m = value.match(/^([\d.,]+(?:\s*[-–\/~]\s*[\d.,]+)?)\s*[\p{L}/.%³°·]{0,8}$/u);
    if (m) return m[1].replace(/\s+/g, "");
  }
  return value;
}

export function numbersIn(value: string) {
  return (value.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => Number(n.replace(/,(?=\d{3}\b)/g, "").replace(",", ".")));
}

export type Check = { level: "warn" | "error"; text: string } | null;

/** Validation shown next to an input. Nothing blocks saving; errors are just hidden on the site. */
export function checkValue(field: Field, value: string): Check {
  if (!value || value === "–") return null;
  if (field.kind === "number") {
    const nums = numbersIn(value);
    if (nums.length === 0) return { level: "error", text: "Тоо биш утга" };
    if (field.range && nums.some((n) => n < field.range![0] || n > field.range![1])) {
      return { level: "warn", text: `Ихэвчлэн ${field.range[0]}–${field.range[1]} ${field.unit ?? ""}`.trim() };
    }
  }
  if (field.kind === "dims" && !bodyParts(value).every(([, part]) => /^\d{3,5}×\d{3,5}×\d{3,5}/.test(part))) return { level: "warn", text: "Урт×Өргөн×Өндөр хэлбэрээр (мм)" };
  if (field.kind === "mark" && !markOf(value)) return { level: "warn", text: "●, ○ эсвэл – сонгоно" };
  if (field.kind === "select" && field.options && !field.options.includes(value)) return { level: "warn", text: "Жагсаалтаас сонгоно уу" };
  return null;
}

// ---------------------------------------------------------------- old tables → sheet

const HEADER_LABELS = ["тохиргооныхувилбар", "тохиргоо", "төсөл"];
const STANDARD = /(cltc|nedc|wltc|chtc)/i;

/** Converts an old free-form table. Rows whose columns don't match the configurations are flagged in `check`. */
export function fromLegacy(rows: string[][]): SpecSheet {
  const withValues = (row: string[]) => row.slice(1).some((cell) => cell.trim());
  const headerIndex = Math.max(0, rows.findIndex((row) => HEADER_LABELS.includes(normalizeLabel(row[0] ?? "")) && withValues(row)));
  const header = rows[headerIndex] ?? [];
  // Dealer rule: the lowest (first) configuration is never sold when there are others.
  const configs: SpecConfig[] = header.slice(1).map((name, i, all) => ({ name: name.trim() || `Тохиргоо ${i + 1}`, sold: !(i === 0 && all.length > 1) }));
  if (configs.length === 0) configs.push({ name: "Стандарт", sold: true });
  const n = configs.length;

  const values: Record<string, string[]> = {};
  const extras: ExtraRow[] = [];
  const check = new Set<string>();
  const colors: string[][] = configs.map(() => []);
  let group = "general";
  let inColors = false;

  const spread = (cells: string[]) => {
    if (cells.length === n) return { cells, ok: true };
    if (cells.length === 1) return { cells: Array(n).fill(cells[0]), ok: true };
    const out = Array.from({ length: n }, (_, i) => cells[Math.min(i, cells.length - 1)] ?? "");
    return { cells: out, ok: false };
  };

  rows.forEach((row, index) => {
    if (index === headerIndex) return;
    const label = (row[0] ?? "").trim();
    if (!label) return;
    if (!withValues(row)) {
      // Group heading. Long "headings" are really values that lost their row; keep them for review.
      inColors = /өнгө/i.test(label);
      const g = GROUPS.find((item) => normalizeLabel(item.label) === normalizeLabel(label));
      if (g) group = g.key;
      if (label.length > 40) extras.push({ group, label: "Тайлбар", values: Array(n).fill(label) });
      return;
    }
    const cells = row.slice(1).map((cell) => cell.trim());
    while (cells.length > 1 && !cells[cells.length - 1]) cells.pop();
    const { cells: spreadCells, ok } = spread(cells);
    const key = ALIAS.get(normalizeLabel(label));
    const field = key ? FIELD[key] : undefined;

    if (inColors && !field) {
      // Colour rows: "Оддын саарал | ● | ○ ¥5,000" → name collected per configuration.
      spreadCells.forEach((cell, i) => { if (/^[●○]/.test(normalizeMark(cell))) colors[i].push(label); });
      return;
    }
    if (!field) {
      extras.push({ group, label, values: spreadCells.map((cell) => cleanValue(undefined, cell)) });
      return;
    }
    group = field.group;
    if (values[field.key]) return; // first occurrence wins (later duplicates are sub-rows of merged headers)
    values[field.key] = spreadCells.map((cell) => cleanValue(field, cell));
    if (!ok) check.add(field.key);
    if (field.key === "range") {
      const std = label.match(STANDARD)?.[1]?.toUpperCase() ?? (/цэнэглэлтийн зай|үйл ажиллагааны/i.test(label) ? "CLTC" : "");
      if (std) values.range_std = Array(n).fill(std);
    }
  });

  // Separate length / width / height rows → one size value.
  if (!values.size) {
    const part = (name: string) => rows.find((row) => normalizeLabel(row[0] ?? "") === name);
    const [l, w, h] = ["урт", "өргөн", "өндөр"].map(part);
    if (l && w && h) {
      values.size = configs.map((_, i) => [l, w, h].map((row) => spread(row.slice(1)).cells[i]).map((v) => numbersIn(v ?? "")[0] ?? "").join("×"));
      for (const name of ["Урт", "Өргөн", "Өндөр"]) {
        const at = extras.findIndex((row) => normalizeLabel(row.label) === normalizeLabel(name));
        if (at >= 0) extras.splice(at, 1);
      }
    }
  }
  if (!values.color_ext && colors.some((list) => list.length)) values.color_ext = colors.map((list) => list.join(", "));

  // Manufacturer warranty rows are replaced by the dealer's own terms (DEALER_WARRANTY).
  const filtered = extras.filter((row) => !/баталгаа/i.test(row.label) && !/[¥￥]/.test(row.values.join("")));
  return { configs, values, extras: filtered, check: [...check], converted: true };
}

// ---------------------------------------------------------------- sheet → page

export type CompareRow = { label: string; cells: string[] };
export type ChipGroup = { heading: string; chips: string[] };
/** One line of the short "Гол үзүүлэлт" list (icon key → components/model/SpecIcon). */
export type KeySpec = { icon: string; label: string; value: string; href?: string };
/** One line of the short "Тоноглол" list for one trim: standard, optional extra, or not available (struck through). */
export type EquipItem = { icon: string; label: string; state: "yes" | "option" | "none" };
/** One trim (иж бүрдэл) as shown in the spec section: its own key numbers and equipment. */
export type PickerOption = {
  /** Column in SheetView.configs / the comparison tables. */
  col: number;
  name: string;
  trim: string;
  cabin: string;
  price?: number;
  /** Key numbers, per body type ("" when the model has one body). */
  specs: { body: string; items: KeySpec[] }[];
  equipment: EquipItem[];
};
export type Picker = {
  trims: string[];
  cabins: string[];
  bodies: string[];
  options: PickerOption[];
  /** Battery choices side by side (R5 / EC75 style), only when there are two or more. */
  cards: { title: string; lines: { label: string; value: string }[] }[];
};
export type SheetView = {
  configs: string[];
  compare: CompareRow[];
  chips: ChipGroup[];
  optional: string[];
  full: { heading: string; rows: CompareRow[] }[];
  /** Number of rows behind "Бүх үзүүлэлтийг харах". */
  total: number;
  picker: Picker;
};

// Short lists shown before "Бүх үзүүлэлтийг харах" — in priority order, at most 10 each.
const KEY_SPECS: { key: string; icon: string }[] = [
  { key: "range", icon: "range" }, { key: "total_range", icon: "range" }, { key: "battery_kwh", icon: "battery" },
  { key: "dc_time", icon: "charging" }, { key: "power", icon: "motor" }, { key: "payload", icon: "payload" },
  { key: "size", icon: "dimension" }, { key: "cargo_size", icon: "cargo" }, { key: "seats", icon: "seats" },
  { key: "drive", icon: "drive" }, { key: "tank", icon: "fuel" }
];
const KEY_EQUIPMENT: { key: string; icon: string }[] = [
  { key: "rear_camera", icon: "camera" }, { key: "camera360", icon: "camera360" }, { key: "abs", icon: "shield" },
  { key: "esc", icon: "steer" }, { key: "aeb", icon: "brake" }, { key: "acc", icon: "cruise" }, { key: "tpms", icon: "tire" },
  { key: "v2l", icon: "plug" }, { key: "ac", icon: "snow" }, { key: "bluetooth", icon: "bluetooth" }, { key: "app", icon: "phone" },
  { key: "ota", icon: "cloud" }, { key: "battery_heating", icon: "heat" }, { key: "regen", icon: "regen" },
  { key: "ldw", icon: "lane" }, { key: "dms", icon: "eye" }
];

/** Configurations shown on the site: for sale and with every must-have item (rear camera) as standard. */
export function onSite(sheet: SpecSheet, i: number) {
  return sheet.configs[i]?.sold !== false && FIELDS.every((field) => !field.mustHave || markOf(sheet.values[field.key]?.[i] ?? "") === "●");
}

/** For admin: configurations hidden only because a must-have item is missing. */
export function mustHaveMissing(sheet: SpecSheet): { config: string; label: string }[] {
  const out: { config: string; label: string }[] = [];
  sheet.configs.forEach((config, i) => {
    if (!config.sold) return;
    for (const field of FIELDS.filter((item) => item.mustHave)) {
      if (markOf(sheet.values[field.key]?.[i] ?? "") !== "●") out.push({ config: config.name, label: field.label });
    }
  });
  return out;
}

/** "Задгай, торон хаалттай: 115 · Битүү: 105" → the part for one body type ("Задгай" etc.). */
export function valueForBody(value: string, body: string) {
  const parts = bodyParts(value);
  if (!body || (parts.length === 1 && !parts[0][0])) return value;
  const hit = parts.find(([label]) => label.toLowerCase().split(/,\s*/).includes(body.toLowerCase()));
  return (hit ?? parts[0])[1];
}

/** "52.16 (2C)" + "кВт·ц" → "52.16 кВт·ц (2C)": the unit goes right after the leading number. */
function withUnit(value: string, unit?: string): string {
  if (!unit || !value || value === "–" || value.includes(unit)) return value;
  const parts = bodyParts(value);
  if (parts.length > 1 || parts[0][0]) return parts.map(([body, part]) => (body ? `${body}: ${withUnit(part, unit)}` : withUnit(part, unit))).join(" · ");
  const m = value.match(/^([<>≤≥]?[\d.,]+(?:\s*[-–\/~×]\s*[\d.,]+)*)(.*)$/);
  return m ? `${m[1]} ${unit}${m[2] ? ` ${m[2].trim()}` : ""}` : value;
}

/** Several "L×W×H" values → one "5950–5990×1880×2030–2695" range (null when the values have none). */
function dimsRange(list: string[]): string | null {
  const triples = list.flatMap((value) => [...value.matchAll(/(\d{3,5})×(\d{3,5})×(\d{3,5})/g)].map((m) => [1, 2, 3].map((i) => Number(m[i]))));
  if (triples.length === 0) return null;
  return [0, 1, 2].map((d) => {
    const nums = triples.map((t) => t[d]);
    const min = Math.min(...nums), max = Math.max(...nums);
    return min === max ? String(min) : `${min}–${max}`;
  }).join("×");
}

const DRIVE_LABEL: Record<string, string> = { FWD: "Урд дугуйгаар (FWD)", RWD: "Хойд дугуйгаар (RWD)", AWD: "Бүх дугуйгаар (AWD)" };

function aggregate(field: Field, list: string[]): string {
  if (field.key === "drive") list = list.map((value) => DRIVE_LABEL[value] ?? value);
  const unique = [...new Set(list.filter((value) => value && value !== "–"))];
  if (unique.length === 0) return "";
  // Body-dependent values ("Задгай: … · Битүү: …"): numbers as one range, sizes for the first body type.
  if (unique.some((value) => bodyParts(value).length > 1)) {
    if (field.kind === "number") {
      const nums = unique.flatMap(numbersIn);
      const min = Math.min(...nums), max = Math.max(...nums);
      if (nums.length) return withUnit(min === max ? String(min) : `${min}–${max}`, field.unit);
    }
    if (field.kind === "dims" || field.key === "cargo_size") {
      const first = unique.map((value) => bodyParts(value)[0]);
      const range = dimsRange(first.map(([, part]) => part));
      if (range) return `${withUnit(range, field.unit)}${first[0][0] ? ` (${first[0][0].toLowerCase()})` : ""}`;
    }
  }
  if (field.kind === "dims" || field.key === "cargo_size") {
    const range = dimsRange(unique);
    if (range && (unique.length > 1 || bodyParts(unique[0]).length > 1)) return withUnit(range, field.unit);
  }
  if (unique.length === 1) return withUnit(unique[0], field.unit);
  if (field.kind === "number") {
    const nums = unique.flatMap(numbersIn);
    if (nums.length) {
      const min = Math.min(...nums), max = Math.max(...nums);
      return withUnit(min === max ? String(min) : `${min}–${max}`, field.unit);
    }
  }
  return unique.length <= 3 ? unique.map((value) => withUnit(value, field.unit)).join(" / ") : "Тохиргооноос хамаарна";
}

/** Everything the page needs, computed only from the configurations marked for sale. */
/**
 * Columns shown on the site. Normally the configurations passing onSite(); when none has the
 * must-have items, only the highest configuration for sale ("High", the last column) is kept.
 */
export function siteColumns(sheet: SpecSheet): number[] {
  const cols = sheet.configs.map((_, i) => (onSite(sheet, i) ? i : -1)).filter((i) => i >= 0);
  if (cols.length) return cols;
  const sold = sheet.configs.map((config, i) => (config.sold !== false ? i : -1)).filter((i) => i >= 0);
  return sold.length ? [sold[sold.length - 1]] : [];
}

export function viewSheet(sheet: SpecSheet, fuel?: string): SheetView {
  const cols = siteColumns(sheet);
  const groups = GROUPS.filter((group) => !group.fuelOnly || needsExtender(fuel));
  const visible = (field: Field) => !field.hidden && groups.some((group) => group.key === field.group);
  const pick = (field: Field) => cols.map((i) => {
    const value = sheet.values[field.key]?.[i] ?? "";
    return checkValue(field, value)?.level === "error" ? "" : value;
  });
  const fields = FIELDS.filter(visible);

  const compare: CompareRow[] = [];
  if (cols.length > 1) {
    const merged = new Map<string, CompareRow>();
    for (const field of fields) {
      if (field.key === "range_std") continue;
      const cells = pick(field);
      const shown = cells.map((value) => (field.kind === "mark" ? value || "–" : withUnit(value, field.unit) || "–"));
      // Marks differ only when the sign differs; "● LED" vs "● галоген" is a note, not a difference.
      if (new Set(field.kind === "mark" ? shown.map((value) => markOf(value) || value) : shown).size < 2) continue;
      if (field.kind === "mark") {
        const signature = `${field.group}|${shown.join("|")}`;
        const row = merged.get(signature);
        if (row) { row.label += `, ${field.short ?? field.label}`; continue; }
        const next = { label: field.short ?? field.label, cells: shown };
        merged.set(signature, next);
        compare.push(next);
      } else {
        compare.push({ label: field.label, cells: shown });
      }
    }
  }

  const chips: ChipGroup[] = [];
  const optional: string[] = [];
  for (const group of groups.filter((g) => g.part === "equipment")) {
    const list: string[] = [];
    for (const field of fields.filter((item) => item.group === group.key && item.kind === "mark")) {
      const marks = pick(field).map(markOf);
      if (marks.every((m) => m === "●")) list.push(field.label);
      else if (marks.every((m) => m === "○")) optional.push(field.label);
    }
    if (list.length) chips.push({ heading: group.label, chips: list });
  }

  const full = groups.map((group) => {
    const rows: CompareRow[] = fields.filter((field) => field.group === group.key && field.key !== "range_std").map((field) => ({
      label: field.unit && field.kind !== "dims" ? `${field.label} (${field.unit})` : field.kind === "dims" ? `${field.label} (${field.unit})` : field.label,
      cells: pick(field).map((value) => value || "")
    })).filter((row) => row.cells.some(Boolean));
    for (const extra of sheet.extras.filter((row) => row.group === group.key)) {
      const cells = cols.map((i) => extra.values[i] ?? "");
      if (cells.some(Boolean)) rows.push({ label: extra.label, cells });
    }
    if (group.key === "battery") rows.push({ label: "Батерейн баталгаа", cells: cols.map(() => DEALER_WARRANTY) });
    return { heading: group.label, rows };
  }).filter((group) => group.rows.length);

  const total = full.reduce((sum, group) => sum + group.rows.length, 0);
  return {
    configs: cols.map((i) => sheet.configs[i].name), compare, chips, optional, full, total,
    picker: buildPicker(sheet, cols, fuel, new Set(fields.map((field) => field.key)))
  };
}

function buildPicker(sheet: SpecSheet, cols: number[], fuel: string | undefined, visible: Set<string>): Picker {
  const value = (key: string, i: number) => {
    const raw = sheet.values[key]?.[i] ?? "";
    return FIELD[key] && checkValue(FIELD[key], raw)?.level === "error" ? "" : raw;
  };
  const extender = needsExtender(fuel);

  const bodies: string[] = [];
  for (const list of Object.values(sheet.values)) {
    for (const i of cols) {
      for (const [label] of bodyParts(list[i] ?? "")) {
        for (const body of label ? label.split(/,\s*/) : []) {
          const name = body.charAt(0).toUpperCase() + body.slice(1);
          if (!bodies.includes(name)) bodies.push(name);
        }
      }
    }
  }

  // Ten key numbers per trim and body: nine from KEY_SPECS that have a value, plus the dealer warranty.
  const std = [...new Set(cols.map((i) => value("range_std", i)).filter(Boolean))];
  const rangeLabel = `${extender ? "Цахилгаанаар" : "Туулах зай"}${std.length === 1 ? ` (${std[0]})` : ""}`;
  const specs = (i: number) => (bodies.length ? bodies : [""]).map((body) => {
    const items = KEY_SPECS.filter((item) => visible.has(item.key)).map((item): KeySpec => {
      const field = FIELD[item.key];
      const raw = valueForBody(value(item.key, i), body);
      const shown = !raw || raw === "–" ? "" : item.key === "drive" ? DRIVE_LABEL[raw] ?? raw : withUnit(raw, field.unit);
      return { icon: item.icon === "drive" ? (raw || "rwd").toLowerCase() : item.icon, label: item.key === "range" ? rangeLabel : field.label, value: shown };
    }).filter((item) => item.value).slice(0, 9);
    items.push({ icon: "shield", label: "Батерейн баталгаа", value: DEALER_WARRANTY, href: "/warranty/" });
    return { body, items };
  });

  // The same ten equipment lines for every trim, so switching trims shows what comes and goes.
  const equipKeys = KEY_EQUIPMENT.filter((item) => visible.has(item.key) && cols.some((i) => markOf(value(item.key, i)))).slice(0, 10);
  const equipment = (i: number): EquipItem[] => equipKeys.map((item) => {
    const mark = markOf(value(item.key, i));
    return { icon: item.icon, label: FIELD[item.key].label, state: mark === "●" ? "yes" : mark === "○" ? "option" : "none" };
  });

  const options: PickerOption[] = cols.map((i, col) => {
    const cabin = value("cabin", i);
    const name = sheet.configs[i].name;
    const trim = cabin && name.endsWith(` · ${cabin}`) ? name.slice(0, -` · ${cabin}`.length) : name;
    return { col, name, trim, cabin, price: sheet.configs[i].price, specs: specs(i), equipment: equipment(i) };
  });
  const trims = [...new Set(options.map((option) => option.trim))];
  const cabins = [...new Set(options.map((option) => option.cabin).filter(Boolean))];

  const cards: Picker["cards"] = [];
  const byBattery = new Map<string, number[]>();
  for (const i of cols) {
    const kwh = value("battery_kwh", i);
    if (kwh) byBattery.set(kwh, [...(byBattery.get(kwh) ?? []), i]);
  }
  if (byBattery.size > 1) {
    for (const [kwh, list] of [...byBattery].sort((x, y) => numbersIn(x[0])[0] - numbersIn(y[0])[0])) {
      const lines = ["range", "dc_time", "power"].map((key) => ({
        label: key === "range" ? "Туулах зай" : FIELD[key].label,
        value: aggregate(FIELD[key], list.map((i) => value(key, i)))
      })).filter((line) => line.value);
      cards.push({ title: withUnit(kwh, FIELD.battery_kwh.unit), lines });
    }
  }

  return { trims, cabins, bodies, options, cards };
}

/** Dealer minimum (`required`) missing on a configuration that is for sale. */
export function missingRequired(sheet: SpecSheet): { config: string; label: string }[] {
  const out: { config: string; label: string }[] = [];
  sheet.configs.forEach((config, i) => {
    if (!config.sold) return;
    for (const field of FIELDS.filter((item) => item.required)) {
      const value = sheet.values[field.key]?.[i] ?? "";
      const has = field.kind === "mark" ? /^[●○]/.test(value) : Boolean(value && value !== "–");
      if (!has) out.push({ config: config.name, label: field.label });
    }
  });
  return out;
}

/** Parses a sheet posted by the admin form; anything malformed is dropped rather than trusted. */
export function parseSheet(json: string): SpecSheet | null {
  let raw: unknown;
  try { raw = JSON.parse(json); } catch { return null; }
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<SpecSheet>;
  const str = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");
  const configs = (Array.isArray(data.configs) ? data.configs : []).slice(0, 16)
    .map((config, i) => {
      const price = Number(String(config?.price ?? "").replace(/[^\d]/g, ""));
      return { name: str(config?.name, 80) || `Тохиргоо ${i + 1}`, sold: config?.sold !== false, ...(price > 0 ? { price } : {}) };
    });
  if (configs.length === 0) return null;
  const n = configs.length;
  const fit = (list: unknown) => Array.from({ length: n }, (_, i) => str(Array.isArray(list) ? list[i] : ""));
  const values: Record<string, string[]> = {};
  for (const field of FIELDS) {
    const list = fit(data.values?.[field.key]).map((value) => (field.kind === "mark" ? normalizeMark(value) : value));
    if (list.some(Boolean)) values[field.key] = list;
  }
  const extras = (Array.isArray(data.extras) ? data.extras : []).slice(0, 200)
    .map((row) => ({ group: GROUPS.some((g) => g.key === row?.group) ? row.group : "general", label: str(row?.label, 120), values: fit(row?.values) }))
    .filter((row) => row.label && row.values.some(Boolean));
  const check = (Array.isArray(data.check) ? data.check : []).filter((key): key is string => typeof key === "string" && key in FIELD);
  const source = str(data.source, 160);
  return { configs, values, extras, check, ...(source ? { source } : {}) };
}

/** Values already used across all models, most common first — offered as suggestions in the form. */
export function collectSuggestions(sheets: SpecSheet[], limit = 12): Record<string, string[]> {
  const counts: Record<string, Map<string, number>> = {};
  for (const sheet of sheets) {
    for (const [key, list] of Object.entries(sheet.values)) {
      const field = FIELD[key];
      if (!field || field.kind === "mark") continue;
      const map = (counts[key] ??= new Map());
      for (const value of new Set(list)) {
        if (value && value !== "–" && value.length <= 80 && checkValue(field, value)?.level !== "error") map.set(value, (map.get(value) ?? 0) + 1);
      }
    }
  }
  return Object.fromEntries(Object.entries(counts).map(([key, map]) => [
    key, [...new Set([...(FIELD[key].options ?? []), ...[...map].sort((a, b) => b[1] - a[1]).map(([value]) => value)])].slice(0, limit)
  ]));
}
