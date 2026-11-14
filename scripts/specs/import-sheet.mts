// Google Sheet «Ruichi specs» tab → SpecSheet (models.specs).
//
//   node --experimental-strip-types scripts/specs/import-sheet.mts <tab.json> "<tab name>" <out.json>
//
// <tab.json> is the tab's cell grid (string[][]) as returned by the Sheets API.
// Rows are recognised by their Chinese label first (the PDF original), then English —
// never by the machine-translated Mongolian column. Values are translated with the
// dictionary below; anything still in English is listed in `check` for the admin to review.
// Prices (¥) and the manufacturer warranty are skipped: the dealer's terms apply.

import { FIELD, GROUPS, checkValue, normalizeMark, type ExtraRow, type SpecSheet } from "../../src/data/specSheet.ts";
import { readFileSync, writeFileSync } from "node:fs";

type Rule = { cn?: RegExp; en?: RegExp; key?: string; part?: string; extra?: string; group?: string; skip?: true };

// Order matters: the first matching rule wins.
const RULES: Rule[] = [
  { cn: /版本|产品名称|指导价|质保|保修/, en: /^(verison|version|productname|configurationversion|marketguideprice|price|warranty)/, skip: true },
  { cn: /配置版本/, skip: true },
  { cn: /动力类型|能源类型/, en: /^(powertype|powertraintype|energytype)$/, key: "energy" },
  { cn: /燃料形式/, key: "fuel_kind", extra: "Түлшний төрөл", group: "extender" },
  { cn: /驾驶室/, en: /^(cockpit|cab)$/, key: "cabin" },
  { cn: /车身结构|车体结构/, key: "body" },
  { cn: /前后轮距/, key: "track" },
  { cn: /前轮距/, key: "track", part: "front" },
  { cn: /后轮距/, key: "track", part: "rear" },
  { cn: /货箱内部尺寸|货箱尺寸/, en: /^cargo/, key: "cargo_size" },
  { cn: /外形尺寸|长宽高/, en: /^(lengthwidthheight|body|vehicledimensions)$/, key: "size" },
  { cn: /^长度$/, key: "size", part: "l" },
  { cn: /^宽度$/, key: "size", part: "w" },
  { cn: /^高度$/, key: "size", part: "h" },
  { cn: /轴距/, key: "wheelbase" },
  { cn: /整备质量/, key: "curb_weight" },
  { cn: /总质量/, key: "gross_weight" },
  { cn: /额定载/, en: /payload|ratedload/, key: "payload" },
  { cn: /车门数/, key: "doors" },
  { cn: /座位数/, key: "seats" },
  { cn: /最高车速/, key: "top_speed" },
  { cn: /载货容积|货箱容积/, key: "cargo_volume" },
  { cn: /驱动桥速比/, key: "gear_ratio" },
  { cn: /接近角/, key: "approach", part: "a" },
  { cn: /离去角/, key: "approach", part: "d" },
  { cn: /最大爬坡/, extra: "Өгсөх чадвар (%)", group: "dims" },
  { cn: /制冷温度/, extra: "Хөргөлтийн хэм (℃)", group: "dims" },

  { cn: /^增程器$/, en: /^rangeextender$/, key: "engine_model" },
  { cn: /^发动机$|发动机型号/, en: /^engine(model)?$/, key: "engine_model", part: "engine" },
  { cn: /排量/, key: "displacement" },
  { cn: /排放标准/, key: "emission" },
  { cn: /最大净功率|^最大功率$/, extra: "Хөдөлгүүрийн чадал (кВт)", group: "extender" },
  { cn: /最大净扭矩|^最大扭矩$/, extra: "Хөдөлгүүрийн эргэх момент (Н·м)", group: "extender" },
  { cn: /最大功率转速/, skip: true },
  { cn: /油箱|储气|气瓶/, key: "tank" },
  { cn: /总续航|综合续航/, key: "total_range" },
  { cn: /加权综合燃料/, extra: "Жигнэсэн түлшний зарцуулалт (л/100км)", group: "extender" },
  { cn: /油耗|耗气/, key: "fuel_use" },

  { cn: /电池类型/, key: "battery_type" },
  { cn: /电池电量|电池容量/, key: "battery_kwh" },
  { cn: /电池加热/, key: "battery_heating" },
  { cn: /续航/, key: "range" },
  { cn: /耗电量|电耗/, key: "consumption" },
  { cn: /快充功能/, key: "dc" },
  { cn: /快充时间/, key: "dc_time" },
  { cn: /快充.*类型|快充类型|^类型$/, skip: true },
  { cn: /慢充功率/, key: "ac_power" },
  { cn: /慢充时间/, key: "ac_time" },
  { cn: /驱动电机数/, extra: "Моторын тоо", group: "motor" },
  { cn: /后电动机/, skip: true },
  { cn: /电机类型/, key: "motor_type" },
  { cn: /电机布局/, key: "motor_layout" },
  { cn: /峰值功率|电动机总功率/, key: "power" },
  { cn: /峰值扭矩|电动机总扭矩/, key: "torque" },

  { cn: /驱动形式|驱动方式/, key: "drive" },
  { cn: /前悬架/, key: "front_susp" },
  { cn: /后悬架/, key: "rear_susp" },
  { cn: /前制动器/, key: "brakes", part: "front" },
  { cn: /后制动器/, key: "brakes", part: "rear" },
  { cn: /制动器形式|制动器类型/, key: "brakes" },
  { cn: /驻车制动/, key: "parking_brake" },
  { cn: /多种助力模式/, extra: "Жолооны хүчлүүрийн горим", group: "chassis" },
  { cn: /转向系统|助力类型/, key: "steering" },
  { cn: /后轮胎规格/, key: "tyres", part: "rear" },
  { cn: /轮胎规格/, key: "tyres" },
  { cn: /轮胎个数/, extra: "Дугуйн тоо", group: "chassis" },
  { cn: /轮辋/, key: "rims" },
  { cn: /备胎/, key: "spare" },

  { cn: /全车玻璃|车窗|玻璃升降/, key: "windows" },
  { cn: /雨刮/, key: "wipers" },
  { cn: /外后视镜/, key: "mirrors" },
  { cn: /侧防护/, extra: "Хажуугийн хамгаалалтын иж бүрдэл", group: "comfort" },
  { cn: /前组合灯|大灯$/, key: "headlights" },
  { cn: /大灯高度/, key: "light_height" },
  { cn: /大灯自动/, key: "auto_lights" },
  { cn: /远近光/, key: "hma" },
  { cn: /日间行车灯/, key: "drl" },
  { cn: /雾灯/, key: "fog" },
  { cn: /高位制动灯/, key: "brake_light" },
  { cn: /组合仪表|仪表/, key: "cluster" },
  { cn: /^空调$/, key: "ac" },
  { cn: /^usb接口$/, key: "usb", part: "usb" },
  { cn: /typec/, key: "usb", part: "c" },
  { cn: /内后视镜/, key: "inner_mirror" },
  { cn: /换挡/, key: "gear_selector" },
  { cn: /遮阳板/, extra: "Нарны халхавч", group: "comfort" },
  { cn: /多功能方向盘/, key: "mf_wheel" },
  { cn: /方向盘.*调/, key: "wheel_adjust" },
  { cn: /前阅读灯/, key: "reading" },
  { cn: /后阅读灯/, extra: "Арын унших гэрэл", group: "lights" },
  { cn: /座椅材质/, key: "seat_material" },
  { cn: /主驾座椅/, key: "driver_seat" },
  { cn: /副驾座椅/, key: "passenger_seat" },
  { cn: /二排座椅/, extra: "2-р эгнээний суудал", group: "comfort" },
  { cn: /储物盒/, extra: "Суудал доорх хайрцаг", group: "comfort" },
  { cn: /蓝牙/, key: "bluetooth" },
  { cn: /手机app/, key: "app" },
  { cn: /^mp3$/, key: "radio" },
  { cn: /v2l/, key: "v2l" },
  { cn: /影音系统/, key: "screen" },
  { cn: /扬声器/, key: "speakers" },
  { cn: /语音控制/, key: "voice" },
  { cn: /无线充电/, key: "wireless" },
  { cn: /定速巡航/, key: "cruise" },

  { cn: /上坡辅助/, key: "hill" },
  { cn: /充电锁/, key: "charge_lock" },
  { cn: /低速行人/, key: "pedestrian" },
  { cn: /被动行人保护/, skip: true },
  { cn: /安全带未系/, key: "belt_alert" },
  { cn: /abs|制动力分配/, key: "abs" },
  { cn: /牵引力|tcs/, key: "tcs" },
  { cn: /中控锁/, key: "central_lock" },
  { cn: /自动落锁/, extra: "Явахад автоматаар түгжих", group: "safety" },
  { cn: /驾驶员监测/, key: "dms" },
  { cn: /安全气囊/, key: "airbags" },
  { cn: /碰撞断电/, key: "crash_cutoff" },
  { cn: /事件数据记录|edr/, key: "edr" },
  { cn: /雷达/, key: "radar" },
  { cn: /360/, key: "camera360" },
  { cn: /倒车影像/, key: "rear_camera" },
  { cn: /儿童座椅|isofix/, key: "isofix" },
  { cn: /启动形式/, key: "start" },
  { cn: /驾驶模式/, key: "drive_modes" },
  { cn: /能源模式/, extra: "Эрчим хүчний горим", group: "comfort" },
  { cn: /车联网/, key: "connected" },
  { cn: /远程升级|ota/, key: "ota" },
  { cn: /^etc$/, key: "etc" },
  { cn: /制动能量回馈|能量回收/, key: "regen" },
  { cn: /紧急制动报警/, key: "brake_alert" },
  { cn: /坡道识别/, extra: "Налуу таних, жин хянах", group: "safety" },
  { cn: /胎压监测/, key: "tpms" },
  { cn: /esc|车身稳定/, key: "esc" },
  { cn: /自动驻车/, key: "autohold" },
  { cn: /车道偏离预警/, key: "ldw" },
  { cn: /车道偏离抑制|车道保持/, key: "ldp" },
  { cn: /前方碰撞预警/, key: "fcw" },
  { cn: /主动刹车|自动紧急制动|aeb/, key: "aeb" },
  { cn: /自适应巡航/, key: "acc" },
  { cn: /智能限速/, key: "isa" },
  { cn: /集成式巡航/, key: "ica" }
];

// English → Mongolian, applied in order to every text value.
const DICT: [RegExp, string][] = [
  [/lithium iron phosphate(?: \(LFP\))?/i, "LFP (лити төмрийн фосфат)"],
  [/two-in-one permanent magnet synchronous motor/i, "Байнгын соронзон синхрон мотор (2-in-1)"],
  [/permanent magnet synchronous(?: motor)?(?: \(PMSM\))?/i, "Байнгын соронзон синхрон мотор"],
  [/double wishbone independent suspension/i, "Давхар салаат гартай, бие даасан"],
  [/macpherson independent suspension/i, "Макферсон, бие даасан"],
  [/(\d+(?:\+\d+)?)(?: |-)?(?:piece )?(?:longitudinal )?leaf springs?,? non-independent suspension(?:, with leaf\s*springs mounted on top)?/i, "$1 навчит пүрштэй, хамааралтай"],
  [/front disc and rear drum/i, "Урд диск, хойд хүрд"],
  [/^disc brake$/i, "диск"], [/^drum brake$/i, "хүрд"],
  [/electric power steering \(EPS\)/i, "EPS (цахилгаан)"],
  [/^steel wheels?$/i, "Ган обуд"], [/^alumin(?:i)?um(?: alloy)? wheels?$/i, "Хайлшин обуд"],
  [/electric lifting glass/i, "Цахилгаан цонх"],
  [/^manual$/i, "Гар"], [/^electric$/i, "Цахилгаан"], [/\(electric\)/i, "(цахилгаан)"],
  [/^bone$/i, "Хүрээтэй"], [/^boneless$/i, "Хүрээгүй"],
  [/halogen headlights \+ LED turn signals/i, "Галоген, LED эргэлтийн гэрэл"], [/^halogen$/i, "Галоген"],
  [/(\d+(?:\.\d+)?)-inch LCD screen/i, "$1 инч LCD"],
  [/(\d+(?:\.\d+)?)-inch central control color HD\s*screen/i, "$1 инч төв дэлгэц"],
  [/HAVC \(electric air conditioning, integrated water heating PTC\s*controller\)/i, "Цахилгаан агааржуулагч, PTC халаагууртай"],
  [/^fabric$/i, "Даавуу"], [/^leather$/i, "Арьс"],
  [/driver seat with manual (\d+)-way adjustment and split headrest/i, "Гар тохируулгатай, $1 чиглэл, тусдаа толгойн түшлэгтэй"],
  [/passenger seat with height-adjustable armrest, cup holder, and\s*storage\s*compartment, folding backrest, flip-up seat cushion, and split\s*headrest/i, "Гарын түшлэг, аяганы тавиур, хайрцагтай; түшлэг эвхэгдэж, суудал дээш өргөгдөнө"],
  [/three-seater seat with flip-up cushions.*$/i, "3 хүний, дээш өргөгддөг суудал"],
  [/under passenger seat/i, "Зорчигчийн суудал доор"], [/under the rear seat/i, "Арын суудал доор"],
  [/keyless start/i, "Түлхүүргүй асаалт"],
  [/^arm guard$/i, "Жолооны багана дээр"],
  [/standard\/comfort\/sport/i, "Стандарт / Тав тух / Спорт"], [/^standard$/i, "Стандарт"],
  [/smart energy saving\/smart power/i, "Хэмнэлттэй / Хүчтэй"],
  [/pure electric\/extended range/i, "Цэвэр цахилгаан / Зай сунгагч"],
  [/^drive$/i, "Жолооч"], [/^driver and co-driver$/i, "Жолооч, зорчигч"],
  [/front reading light \+ single\s*microphone/i, "Урд, 1 микрофонтой"], [/front reading light \+ dual\s*microphones/i, "Урд, 2 микрофонтой"],
  [/integrated in instrument panel/i, "багажны самбарт"], [/large screen integration/i, "том дэлгэцэнд"],
  [/^front\s*[─—–-]\s*\/\s*rear\s*●$/i, "Хойд"], [/^front\s*(\d)\s*\/\s*rear\s*(\d)$/i, "Урд $1, хойд $2"],
  [/single[- ]row(?: cabin)?/i, "Нэг эгнээ"], [/double[- ]row(?: cabin)?/i, "Давхар эгнээ"],
  [/gasoline range extender/i, "Бензин зай сунгагч (EREV)"], [/^EV$/i, "Цэвэр цахилгаан"],
  [/monocoque body/i, "Даацын их бие"],
  [/fence height/gi, "торны өндөр"], [/corrugated/gi, "Атираат"], [/plug-in board/gi, "Хавчаар хавтан"],
  [/china vi b/i, "China VI B"]
];

const BODY: Record<string, string> = { flatbed: "Задгай", fence: "Торон хаалттай", box: "Битүү", "flatbed/fence": "Задгай, торон хаалттай" };
const KEEP_LATIN = /\b(Type-C|LFP|PMSM|EPS|C-EPS|R-EPS|EPB|ABS|EBD|ESC|LED|LCD|USB|HD|MP3|PTC|DC|AC|EREV|V2L|OTA|SER\d+\w*|H\d+\w*|China|VI|B|LT|PR|R\d+)\b/g;

const CJK = /[　-〿㐀-鿿＀-￯]/;
const CJK_ALL = /[　-〿㐀-鿿＀-￯]+/g;

/** The English part of an "English\n中文" or "English/中文" cell. */
function english(cell: string) {
  const lines = (cell ?? "").replace(/(\d)\s*门/g, "$1 хаалга").split("\n").map((line) => line.trim()).filter(Boolean);
  const latin = lines.filter((line) => !CJK.test(line));
  const picked = (latin.length ? latin : lines).map((line) => {
    const parts = line.split("/");
    const kept = parts.filter((part) => !CJK.test(part));
    return kept.length && kept.length < parts.length ? kept.join("/") : line;
  });
  return picked.join(" ").replace(CJK_ALL, "").replace(/\s+/g, " ").trim();
}

const norm = (label: string) => (label ?? "").toLowerCase().replace(/[（(][^）)]*[）)]/g, "").replace(/[^\p{L}\p{N}]+/gu, "");

function translate(value: string) {
  let out = value;
  for (const [from, to] of DICT) out = out.replace(from, to);
  return out.replace(/\s+/g, " ").trim();
}

/** Still contains English words after translation → the admin should look at it. */
const untranslated = (value: string) => /[a-z]{4,}/i.test(value.replace(KEEP_LATIN, ""));

function asMark(raw: string) {
  const value = english(raw);
  if (!value) return "";
  if (/^(тийм|support|supported|yes|standard)$/i.test(value)) return "●";
  if (/^(үгүй|no|none|[─—–-]+)$/i.test(value)) return "–";
  if (/^(сонголтоор|optional)$/i.test(value)) return "○";
  const head = value.match(/^([●○]|[─—–-]+)\s*/);
  if (head) {
    const sign = head[1] === "●" ? "●" : head[1] === "○" ? "○" : "–";
    const note = translate(value.slice(head[0].length).replace(/^[(（]|[)）]$/g, "").trim());
    return note && sign !== "–" ? `${sign} ${note}` : sign;
  }
  return normalizeMark(`● ${translate(value)}`);
}

function asNumber(key: string, raw: string) {
  const value = english(raw);
  if (!value || /^(үгүй|no|[─—–-]+)$/i.test(value)) return "";
  if (key === "payload" && /^[\d.]+\s*t$/i.test(value)) return String(Math.round(parseFloat(value) * 1000));
  const m = value.match(/^([<>≤≥]?\s*[\d.,]+(?:\s*[-–\/~]\s*[\d.,]+)?)\s*[\p{L}/.%³°·]{0,8}$/u);
  return m ? m[1].replace(/\s+/g, "") : translate(value);
}

function asText(key: string, raw: string) {
  const value = english(raw);
  if (!value || /^(үгүй|no|[─—–-]+)$/i.test(value)) return value ? "–" : "";
  if (/^(тийм|support|yes)$/i.test(value)) return key === "airbags" ? "Жолоочийн" : "Байгаа";
  if (/^●/.test(value)) return translate(value.replace(/^●\s*[(（]?/, "").replace(/[)）]$/, "")) || "Байгаа";
  if (key === "drive") return /all|4wd|awd/i.test(value) ? "AWD" : /front-wheel|fwd/i.test(value) ? "FWD" : /rear-wheel|rwd/i.test(value) ? "RWD" : value;
  if (key === "motor_layout") return /^rear/i.test(value) ? "Арын" : /^front/i.test(value) ? "Урд" : translate(value);
  if (key === "parking_brake") return /EPB/.test(value) ? "EPB (цахилгаан)" : translate(value);
  if (key === "size" || key === "cargo_size") {
    return translate(value).replace(/(\d)\s*[*x×]\s*(?=\d)/gi, "$1×").replace(/(\d)\s*,\s*(?=\d)/g, "$1/").replace(/(\d)\s+(?=\d{3,5}×)/g, "$1; ");
  }
  if (key === "cabin") return translate(value).replace(/^(Нэг|Давхар) эгнээ.*/, "$1 эгнээ");
  return translate(value);
}

function convertCell(key: string, raw: string) {
  const field = FIELD[key];
  if (!field) return translate(english(raw));
  if (field.kind === "mark") return asMark(raw);
  if (field.kind === "number") return asNumber(key, raw);
  return asText(key, raw);
}

// ---------------------------------------------------------------- tab → sheet

export function importTab(rows: string[][], tab: string, today = new Date().toISOString().slice(0, 10)): { sheet: SpecSheet; report: string[] } {
  const header = rows[2] ?? [];
  const col = { en: -1, subEn: -1, cn: -1, mn: -1 };
  const configCols: number[] = [];
  header.forEach((cell, i) => {
    const h = (cell ?? "").trim();
    if (/^Үзүүлэлт \(EN\)/.test(h)) col.en = i;
    else if (/^Дэд төрөл \(EN\)/.test(h)) col.subEn = i;
    else if (/^Үзүүлэлт \(中文\)/.test(h)) col.cn = i;
    else if (/^Дэд төрөл \(中文\)/.test(h)) { /* same as subEn */ }
    else if (/Монгол нэр|Үзүүлэлт \(MN\)/.test(h)) col.mn = i;
    else if (h) configCols.push(i);
  });
  const n = configCols.length;
  const report: string[] = [];

  type Entry = { key?: string; extra?: string; group?: string; parts: { part?: string; sub: string; cells: string[]; label: string }[] };
  const entries = new Map<string, Entry>();
  const unmatched: string[] = [];
  let names = configCols.map((i) => english(header[i]).replace(/^\d+\.\s*/, ""));
  const productRows: string[][] = [];

  for (const row of rows.slice(3)) {
    if (!row.length) continue;
    const first = (row[0] ?? "").trim();
    if (/^PDF хуудас/.test(first)) continue;
    if (/^Өмнөх хүснэгтийн мэдээлэл/.test(first)) break;
    const en = (row[col.en] ?? "").trim();
    const cn = (row[col.cn] ?? "").trim();
    const cells = configCols.map((i) => (row[i] ?? "").trim());
    if (!en && !cn) continue;
    if (cells.every((cell) => cell === en || cell === cn || !cell)) continue; // section heading
    if (/产品名称/.test(cn)) { productRows.push(cells); continue; }

    const ncn = norm(cn), nen = norm(en);
    const rule = RULES.find((item) => (item.cn && ncn && item.cn.test(ncn)) || (item.en && nen && item.en.test(nen)));
    if (!rule) { unmatched.push(`${english(en) || cn} = ${english(cells[0])}`); continue; }
    if (rule.skip) continue;
    const id = rule.key ?? `extra:${rule.extra}`;
    const entry = entries.get(id) ?? { key: rule.key, extra: rule.extra, group: rule.group, parts: [] };
    entry.parts.push({ part: rule.part, sub: col.subEn >= 0 ? english(row[col.subEn] ?? "") : "", cells, label: english(en) });
    entries.set(id, entry);
  }

  if (productRows.length && names.every((name) => /^PDF багана/.test(name))) {
    names = configCols.map((_, i) => productRows.map((cells) => english(cells[i])).filter(Boolean).join(" · "));
  }
  names = names.map((name) => name.replace(/\s*Edition\b/gi, "").replace(/\s+/g, " ").trim());

  // Body-dependent rows ("Flatbed", "Fence", "Box") become one labelled value per configuration.
  const merge = (key: string, parts: Entry["parts"]) => {
    const bySub = parts.filter((p) => !p.part);
    if (bySub.length <= 1) return bySub[0]?.cells.map((cell) => convertCell(key, cell));
    return Array.from({ length: n }, (_, i) => {
      const list = bySub.map((p) => ({ sub: BODY[p.sub.toLowerCase().replace(/\s+/g, "")] ?? p.sub, value: convertCell(key, p.cells[i]) }));
      if (new Set(list.map((item) => item.value)).size === 1) return list[0].value;
      return list.map((item) => `${item.sub}: ${item.value}`).join(" · ");
    });
  };

  const values: Record<string, string[]> = {};
  const extras: ExtraRow[] = [];
  const check = new Set<string>();
  const at = (parts: Entry["parts"], part: string) => parts.find((p) => p.part === part);

  for (const [, entry] of entries) {
    if (entry.extra) {
      const raw = merge(entry.extra, entry.parts) ?? [];
      // Yes/no rows become marks; "1.0" and "1" are the same number.
      const marks = raw.every((v) => !v || /^(тийм|үгүй|сонголтоор|●|○|[─—–-])/i.test(v));
      const list = raw.map((v) => (marks ? asMark(v) : /^үгүй$/i.test(v) ? "–" : translate(v).replace(/\b(\d+)\.0\b/g, "$1")));
      extras.push({ group: entry.group ?? "general", label: entry.extra, values: list });
      continue;
    }
    const key = entry.key!;
    let list = merge(key, entry.parts);
    const p = entry.parts;
    if (key === "track" && !list && at(p, "front")) {
      list = Array.from({ length: n }, (_, i) => [at(p, "front"), at(p, "rear")].map((x) => english(x?.cells[i] ?? "")).filter(Boolean).join(" / "));
    }
    if (key === "size" && !list && at(p, "l")) {
      list = Array.from({ length: n }, (_, i) => ["l", "w", "h"].map((x) => english(at(p, x)?.cells[i] ?? "")).join("×"));
    }
    if (key === "approach") {
      list = Array.from({ length: n }, (_, i) => [at(p, "a"), at(p, "d")].map((x) => english(x?.cells[i] ?? "")).filter(Boolean).join(" / "));
    }
    if (key === "brakes" && at(p, "front")) {
      list = Array.from({ length: n }, (_, i) => {
        const [front, rear] = [at(p, "front"), at(p, "rear")].map((x) => translate(english(x?.cells[i] ?? "")));
        return front && rear ? `Урд ${front}, хойд ${rear}` : front || rear;
      });
    }
    if (key === "tyres" && at(p, "rear") && list) {
      const rear = at(p, "rear")!.cells.map(english);
      list = list.map((front, i) => (rear[i] && rear[i] !== front ? `${front} / ${rear[i]}` : front));
    }
    if (key === "usb") {
      list = Array.from({ length: n }, (_, i) => {
        const [u, c] = [at(p, "usb"), at(p, "c")].map((x) => english(x?.cells[i] ?? "").replace(/个/g, ""));
        return [u && u !== "–" ? `${u} USB` : "", c && c !== "–" ? `${c} Type-C` : ""].filter(Boolean).join(", ");
      });
    }
    if (key === "engine_model") {
      const ext = p.find((x) => !x.part), eng = at(p, "engine");
      list = Array.from({ length: n }, (_, i) => {
        const [a, b] = [ext, eng].map((x) => english(x?.cells[i] ?? ""));
        return a && b ? `${a} (${b} хөдөлгүүр)` : a || b;
      });
    }
    if (key === "range" && !values.range_std) {
      const std = p.map((x) => x.label.match(/(CLTC|NEDC|WLTC|CHTC)/i)?.[1]).find(Boolean) ?? (/CLTC/i.test(p[0].label) ? "CLTC" : "");
      if (std) values.range_std = Array(n).fill(std.toUpperCase());
    }
    if (!list) continue;
    if (values[key]) continue;
    values[key] = list;

    const field = FIELD[key];
    if (list.some((v) => untranslated(v)) || (field && list.some((v) => checkValue(field, v)?.level === "error")) ||
        (field?.kind === "mark" && list.some((v) => !v) && list.some(Boolean))) check.add(key);
  }

  // Configurations with the same trim name (single / double cab) get the cab added.
  const dup = names.some((name, i) => names.indexOf(name) !== i);
  if (dup && values.cabin) names = names.map((name, i) => `${name} · ${values.cabin[i]}`);
  const configs = names.map((name, i) => ({ name: name || `Тохиргоо ${i + 1}`, sold: true }));

  for (const extra of extras) if (extra.values.some(untranslated)) report.push(`шалгах нэмэлт мөр: ${extra.label} = ${extra.values[0]}`);
  for (const line of unmatched) report.push(`таниагүй мөр: ${line}`);
  report.unshift(`${tab}: ${n} тохиргоо, ${Object.keys(values).length} үзүүлэлт, ${extras.length} нэмэлт мөр, шалгах ${check.size}`);

  const groupsOk = new Set(GROUPS.map((g) => g.key));
  return {
    sheet: {
      configs, values, extras: extras.filter((e) => groupsOk.has(e.group)), check: [...check],
      source: `Google Sheet «Ruichi specs» · ${tab} · ${today}`
    },
    report
  };
}

if (process.argv[1]?.endsWith("import-sheet.mts")) {
  const [input, tab, output] = process.argv.slice(2);
  const { sheet, report } = importTab(JSON.parse(readFileSync(input, "utf8")), tab);
  writeFileSync(output, JSON.stringify(sheet, null, 1));
  console.log(report.join("\n"));
  for (const key of sheet.check ?? []) console.log(`check ${key}: ${sheet.values[key].join(" | ")}`);
}
