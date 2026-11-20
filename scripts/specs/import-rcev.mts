// rc-ev.com product page → our own spec sheet (models.specs), user 2026-11-20: the dealer follows rc-ev.com,
// but its tables are not copied as they are: rows are matched to our FIELDS and values rewritten in our
// standard (Mongolian, abbreviation + explanation). Prices (¥), the manufacturer warranty and colours are left out.
//
//   node --experimental-strip-types scripts/specs/import-rcev.mts <page.html> <out.json> [options]
//     --page C5FSB              page code, for the source line
//     --cols 3,4                keep only these configuration columns (1-based, after the label columns)
//     --prefix "Ачааны"         name prefix (EC75 / R5: cargo and passenger in one sheet, see ConfigPicker)
//     --merge                   merge columns with the same name (6 / 9 seat versions) into one configuration
//     --unsold 1                configurations (1-based, after --cols) marked not for sale
//
// The page's HTML is data: only the spec table (<table> after "车型配置") is read.

import { readFileSync, writeFileSync } from "node:fs";
import { FIELD, GROUPS, checkValue, normalizeMark, type ExtraRow, type SpecSheet } from "../../src/data/specSheet.ts";
import { RULES, norm } from "./import-sheet.mts";

type Rule = (typeof RULES)[number];

// ---------------------------------------------------------------- table → grid

export function grid(html: string): string[][] {
  const anchor = html.indexOf("车型配置", html.indexOf('id="pz"') > 0 ? html.indexOf('id="pz"') : 0);
  const start = html.indexOf("<table", Math.max(anchor, html.indexOf('id="pz"')));
  const table = html.slice(start, html.indexOf("</table>", start));
  const clean = (s: string) => s.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((m) => [...m[0].matchAll(/<t[dh]([^>]*)>([\s\S]*?)<\/t[dh]>/g)].map((c) => ({
    text: clean(c[2]), col: Number(c[1].match(/colspan="(\d+)"/)?.[1] ?? 1), row: Number(c[1].match(/rowspan="(\d+)"/)?.[1] ?? 1)
  })));
  const pending: { text: string; left: number }[] = [];
  return rows.map((cells) => {
    const line: string[] = [];
    let c = 0;
    const fill = () => { while (pending[c]?.left > 0) { line[c] = pending[c].text; pending[c].left--; c++; } };
    for (const cell of cells) {
      fill();
      for (let k = 0; k < cell.col; k++) {
        line[c] = cell.text;
        if (cell.row > 1) pending[c] = { text: cell.text, left: cell.row - 1 };
        c++;
      }
    }
    fill();
    return Array.from(line, (v) => v ?? "");
  });
}

// ---------------------------------------------------------------- rows → fields

// rc-ev labels that the Google Sheet tabs did not have; checked before the shared RULES.
const RCEV_RULES: Rule[] = [
  { cn: /远近光/, key: "hma" },
  { cn: /电池冷却/, key: "battery_cooling" },
  { cn: /快充倍率/, key: "charge_rate" },
  { cn: /^快充类型$/, skip: true },
  { cn: /后排车门开启/, key: "side_doors" },
  { cn: /尾门开启/, key: "rear_door" },
  { cn: /^收音机/, key: "radio" },
  { cn: /app远程/, key: "app" },
  { cn: /智能12v/, key: "12v" },
  { cn: /座椅布局/, key: "seat_layout" },
  { cn: /电子不停车收费/, key: "etc" },
  { cn: /^轮胎$/, key: "tyres" },
  { cn: /^遥控钥匙$/, key: "central_lock" },
  { cn: /主驾安全气囊/, key: "airbags" },
  { cn: /颜色|公告型号|电池技术|拉手颜色|外门拉手|^玻璃$|尾板字标|^项目$|安全拉手/, skip: true },
  { cn: /三排座椅/, extra: "3-р эгнээний суудал", group: "comfort" },
  { cn: /四排座椅/, extra: "4-р эгнээний суудал", group: "comfort" },
  { cn: /后顶灯/, extra: "Арын таазны гэрэл", group: "lights" },
  { cn: /货箱顶棚/, extra: "Ачааны хэсгийн бүрээс", group: "dims" },
  { cn: /行车记录仪/, extra: "Видео бичигч", group: "safety" },
  { cn: /重量监测/, extra: "Жин хянах систем", group: "safety" },
  { cn: /^v2v$/, extra: "V2V (Vehicle-to-Vehicle) — өөр машиныг цэнэглэх", group: "battery" },
  { cn: /安全拉手/, extra: "Бариул", group: "comfort" }
];
const ruleFor = (label: string) => {
  const n = norm(label);
  return [...RCEV_RULES, ...RULES].find((rule) => rule.cn && n && rule.cn.test(n));
};

// ---------------------------------------------------------------- values

const LFP = "LFP (Lithium Iron Phosphate, литийн төмрийн фосфат)";
const EPS = "EPS (Electric Power Steering, цахилгаан хүч өгөгч)";
const EPB = "EPB (Electric Parking Brake, цахилгаан зогсоолын тоормос)";

const BODY: Record<string, string> = { "栏板": "Задгай", "仓栅": "Торон хаалттай", "厢式": "Битүү", "冷藏": "Хөргүүртэй", "栏板、仓栅": "Задгай, торон хаалттай", "载货": "Задгай", "厢货": "Битүү" };

// Chinese → Mongolian, whole phrases first. Every value seen on the EC31, EC31L, C5 Drone, EC75 and R5 pages.
const CN: [RegExp, string][] = [
  [/5\+2片纵置钢板弹簧非独立悬架，?板簧上置/, "Хамаарах тэнхлэг, 5+2 нумтай"],
  [/(\d+(?:\+\d+)?)片(?:纵置)?钢板弹簧非独立悬架/, "Хамаарах тэнхлэг, $1 нумтай"],
  [/(?:纵置)?钢板弹簧非独立悬架/, "Хамаарах тэнхлэг, нумтай"],
  [/麦弗逊独立悬架/, "Үл хамаарах тэнхлэг, Макферсон"],
  [/双叉臂独立悬架/, "Үл хамаарах тэнхлэг, давхар салаат гартай"],
  [/前盘后鼓/, "Урд диск, хойд барабан"], [/前后盘式/, "Урд, хойд диск"], [/盘式制动器/, "диск"], [/鼓式制动器/, "барабан"],
  [/电子助力\s*\(?EPS\)?/, EPS],
  [/HAVC\s*\(电动空调，集成水暖PTC带控制器\)/, "Цахилгаан агааржуулагч, PTC халаагууртай"],
  [/电动单蒸\s*○\s*电动双蒸/, "Цахилгаан, 1 бүстэй; ○ 2 бүстэй"], [/电动单蒸/, "Цахилгаан, 1 бүстэй"], [/电动双蒸/, "Цахилгаан, 2 бүстэй"],
  [/二合一永磁同步电机/, "Байнгын соронзон синхрон мотор (2-in-1)"], [/永磁同步电机/, "Байнгын соронзон синхрон мотор"],
  [/卤素大灯\+LED转向灯/, "Галоген, LED эргэлтийн гэрэл"], [/卤素大灯带透镜/, "Галоген, линзтэй"],
  [/(\d+(?:\.\d+)?)[寸吋]液晶屏/, "$1 инч LCD"], [/(\d+(?:\.\d+)?)[寸吋]数码屏/, "$1 инч дижитал дэлгэц"],
  [/(\d+(?:\.\d+)?)(?:英寸|[寸吋])中控(?:彩色高清)?大屏/, "$1 инч төв дэлгэц"],
  [/蓝牙音响\s*\(带MP3\)/, "Bluetooth аудио, MP3"],
  [/无感启动\s*\(无钥匙启动\)/, "Түлхүүргүй асаалт"],
  [/智慧节能\/智慧动力/, "Хэмнэлттэй / Хүчтэй"], [/标准\/舒适\/运动/, "Стандарт / Тав тух / Спорт"], [/^标准$/, "Стандарт"],
  [/纯电\/增程/, "Цэвэр цахилгаан / Зай сунгагч"],
  [/主驾手动4向调节，?分体式头枕/, "Гар тохируулгатай, 4 чиглэл, тусдаа толгойн түшлэгтэй"],
  [/副驾带扶手\s*\(高度调节\)\+杯托\+储物盒，靠背可折叠，坐垫向上翻转，分体式头枕/, "Гарын түшлэг, аяганы тавиур, хайрцагтай; түшлэг эвхэгдэж, суудал дээш өргөгдөнө"],
  [/副驾4向调节，带扶手\s*\(高度调节\)\+杯托\+储物盒，分体式头枕/, "Гар тохируулгатай, 4 чиглэл; гарын түшлэг, аяганы тавиур, хайрцагтай"],
  [/靠背可调，坐垫可向前翻转，带储物盒/, "Түшлэг тохируулгатай, суудал урагш эргэдэг, хайрцагтай"],
  [/三人连体，坐垫向上翻转，靠背挂装后围板上；?2个分体式头枕/, "3 хүний, суудал дээш өргөгддөг, 2 толгойн түшлэгтэй"],
  [/(\d)人连体，不带头枕，靠背折叠；?/, "$1 хүний, толгойн түшлэггүй, түшлэг эвхэгддэг"],
  [/(\d)人连体，带头枕，靠背折叠；?/, "$1 хүний, толгойн түшлэгтэй, түшлэг эвхэгддэг"],
  [/前后调节\+靠背调节/, "Урагш хойш, түшлэгийн тохируулгатай"], [/前后调节/, "Урагш хойш тохируулгатай"], [/靠背调节/, "Түшлэгийн тохируулгатай"],
  [/^(\d)向$/, "$1 чиглэлд тохируулгатай"],
  [/前阅读灯\+单麦克风/, "Урд, 1 микрофонтой"], [/前阅读灯\+双麦克风/, "Урд, 2 микрофонтой"],
  [/副驾座椅下方/, "Зорчигчийн суудал доор"], [/后排座椅下方/, "Арын суудал доор"],
  [/^主副驾$|^双遮阳板$/, "Жолооч, зорчигч"], [/^主驾$|^单遮阳板$/, "Жолоочийн"],
  [/电动\s*\(主副驾\)/, "Цахилгаан (жолооч, зорчигч)"], [/电动升降玻璃/, "Цахилгаан цонх"],
  [/手动防炫目/, "гар, гялбаа сааруулагчтай"],
  [/仪表集成|集成仪表中/, "багажны самбарт"], [/大屏集成|集成大屏中/, "том дэлгэцэнд"],
  [/1个，Type-C，66W快充\)\/\(1个，USB，数据传输/i, "1 Type-C (66W хурдан цэнэглэлт), 1 USB"],
  [/(\d)个，卤素/, "$1, галоген"],
  [/承载式车身/, "Даацын их бие"], [/^单排$/, "Нэг эгнээ"], [/^双排$/, "Давхар эгнээ"],
  [/^纯电动?$/, "Цэвэр цахилгаан"], [/^汽油增程$/, "Бензин зай сунгагч (EREV)"],
  [/双侧滑门/, "Хоёр талын гүйдэг хаалга"], [/180°对开/, "180° хоёр тийш нээгддэг"],
  [/钢制车轮|^钢轮$/, "Ган обуд"], [/^有骨$/, "Хүрээтэй"], [/^车身同色$/, "Их биеийн өнгөтэй"],
  [/^机械式$/, "Механик гар тоормос"], [/^怀挡$/, "Жолооны багана дээр"],
  [/皮\+织物/, "Арьс + даавуу"], [/^织物$/, "Даавуу"],
  [/全尺寸/, "бүтэн хэмжээтэй"], [/^卤素$/, "Галоген"], [/卤素/, "галоген"], [/^电动$/, "цахилгаан"], [/^手动$/, "Гар"],
  [/(\d+(?:\.\d+)?)\s*kw/gi, "$1 кВт"], [/\(4门\)/, "4 хаалга"], [/^前$/, "Урд цахилгаан цонх"],
  [/国VI\s*B/, "China VI B"], [/瓦楞/g, "атираат"], [/插接板/g, "хавчаар хавтан"], [/栅杆高度/g, "торны өндөр "]
];
const FULLWIDTH: Record<string, string> = { "（": "(", "）": ")", "：": ": ", "，": "，", "；": "；", "／": "/" };
const CJK = /[㐀-鿿]/;

function translate(value: string) {
  let out = value.replace(/[（）：／]/g, (ch) => FULLWIDTH[ch]);
  for (const [from, to] of CN) out = out.replace(from, to);
  return out.replace(/，/g, ", ").replace(/；/g, "; ").replace(/\(\s*\)/g, "").replace(/\s+/g, " ").trim();
}
const isDash = (v: string) => /^[─—–\-/]+$/.test(v.trim());

function asMark(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  if (isDash(v)) return "–";
  if (v === "支持") return "●";
  const head = v.match(/^([●○])\s*/);
  if (head) {
    const note = translate(v.slice(head[0].length).replace(/^[（(]|[）)]$/g, ""));
    return note ? `${head[1]} ${note}` : head[1];
  }
  return normalizeMark(`● ${translate(v)}`);
}

function asNumber(key: string, raw: string) {
  const v = raw.replace(/[（）]/g, (ch) => (ch === "（" ? "(" : ")")).trim();
  if (!v || isDash(v)) return "";
  if (key === "dc_time" && /^[\d.]+\s*h$/i.test(v)) return String(Math.round(parseFloat(v) * 60));
  if (key === "ac_power") { const m = v.match(/([\d.]+)\s*kW/i); if (m) return m[1]; }
  // "58.24(2C超充)" → "58.24": the 2C note has its own row (C-rate).
  if (/^[\d.]+\s*\(.*超充.*\)$/.test(v)) return v.replace(/\s*\(.*$/, "");
  // "1390(PVC)/1415(瓦楞)" keeps both, labelled.
  if (/\(/.test(v)) return translate(v).replace(/\s*\/\s*/g, " / ").replace(/(\d)\(/g, "$1 (");
  const m = v.match(/^([<>≤≥]?\s*[\d.,]+(?:\s*[-–\/~]\s*[\d.,]+)?)\s*[^\d]{0,6}$/u);
  return m ? m[1].replace(/\s+/g, "") : translate(v);
}

function asText(key: string, raw: string) {
  const v = raw.replace(/[（）]/g, (ch) => (ch === "（" ? "(" : ")")).trim();
  if (!v) return "";
  if (isDash(v)) return "–";
  if (key === "drive") return /前驱/.test(v) ? "FWD" : /后驱/.test(v) ? "RWD" : /四驱|全驱/.test(v) ? "AWD" : translate(v);
  if (key === "motor_layout") return /前置/.test(v) ? "Урд" : /后置/.test(v) ? "Арын" : /横置/.test(v) ? "Хөндлөн" : translate(v);
  if (key === "parking_brake") return /EPB/.test(v) ? EPB : translate(v);
  if (key === "battery_type") return /磷酸铁锂/.test(v) ? (v.replace(/[（(]?磷酸铁锂[）)]?/, "").trim() ? `${LFP}, ${translate(v.replace(/[（(]?磷酸铁锂[）)]?/, "")).replace(/^赣锋$/, "Ganfeng").replace(/^宁德$/, "CATL")}` : LFP) : translate(v);
  if (key === "steering") return /^电子助力/.test(v) ? EPS : translate(v);
  if (key === "battery_cooling") return /液冷/.test(v) ? "Шингэн хөргөлт" : /风冷/.test(v) ? "Агаар хөргөлт" : translate(v);
  if (key === "airbags") {
    const driver = /主驾?\s*●/.test(v), passenger = /副驾?\s*●/.test(v);
    return driver && passenger ? "Жолооч, зорчигч" : driver ? "Жолоочийн" : /●/.test(v) && !/副/.test(v) ? "Жолоочийн" : "–";
  }
  if (key === "radar") {
    const front = /前\s*●/.test(v), rear = /后\s*●/.test(v);
    const nums = v.match(/前\s*(\d)\s*\/\s*后\s*(\d)/);
    return nums ? `Урд ${nums[1]}, хойд ${nums[2]}` : front && rear ? "Урд, хойд" : rear ? "Хойд" : front ? "Урд" : "–";
  }
  if (key === "size" || key === "cargo_size") {
    return translate(v).replace(/(\d)\s*[*x×]\s*(?=\d)/gi, "$1×").replace(/\(PVC\)/g, " (PVC)").replace(/\(атираат\)/g, " (атираат)")
      .replace(/,\s*(?=\d{4}\s*×)/g, " / ").replace(/(\d),(?=\d{4}\b)/g, "$1/").replace(/\)\s*\/\s*/g, ") / ")
      .replace(/(атираат|хавчаар хавтан):\s*/g, "$1 ").replace(/\s+/g, " ").trim();
  }
  if (/^●/.test(v)) return translate(v.replace(/^●\s*\(?/, "").replace(/\)$/, "")) || "Байгаа";
  return translate(v);
}

function convert(key: string, raw: string) {
  const field = FIELD[key];
  // Parking radar is a mark with the sensor positions as its note: "前─ / 后●" → "● Хойд".
  if (key === "radar") { const where = asText(key, raw); return where === "–" ? "–" : where ? `● ${where}` : ""; }
  if (!field) return isDash(raw) ? "–" : translate(raw.replace(/^●\s*/, "● "));
  if (field.kind === "mark") return asMark(raw);
  if (field.kind === "number") return asNumber(key, raw);
  return asText(key, raw);
}

// ---------------------------------------------------------------- names

const TRIM: [RegExp, string][] = [
  [/智行超充版/, "Smart Supercharge"], [/超充版/, "Supercharge"], [/智行版/, "Smart Driving"], [/标准版/, "Standard"],
  [/智行先锋版/, "Smart Driving Pioneer"], [/智行超越版/, "Smart Driving Transcendence"], [/创业版/, "Startup"],
  [/先锋[型版]\s*(Ⅱ|II)/, "Pioneer II"], [/超越[型版]\s*(Ⅱ|II)/, "Transcendence II"], [/先锋[型版]\s*(Ⅰ|I)/, "Pioneer I"], [/超越[型版]\s*(Ⅰ|I)/, "Transcendence I"],
  [/先锋[型版]/, "Pioneer"], [/超越[型版]/, "Transcendence"], [/非营运|营运版/, ""],
  [/EC31L?载货/, "Задгай"], [/EC31L?仓栅/, "Торон хаалттай"], [/EC31L?厢货\s*\(?瓦楞\)?/, "Битүү (атираат)"], [/单排|双排|纯电|汽油增程/, ""]
];
const trimName = (text: string) => TRIM.reduce((out, [from, to]) => out.replace(from, to), text.replace(/[（）]/g, (ch) => (ch === "（" ? "(" : ")"))).replace(/\s+/g, " ").trim();

// ---------------------------------------------------------------- page → sheet

export function importPage(html: string, opts: { page: string; cols?: number[]; prefix?: string; merge?: boolean; unsold?: number[] }) {
  const g = grid(html);
  const head = g.find((row) => /配置版本|^项目$/.test(row[0])) ?? g[0];
  let labelCols = 1;
  while (labelCols < head.length && head[labelCols] === head[0]) labelCols++;
  let cols = Array.from({ length: head.length - labelCols }, (_, i) => i);
  if (opts.cols) cols = opts.cols.map((c) => c - 1);
  const n = cols.length;
  const cells = (row: string[]) => cols.map((i) => row[labelCols + i] ?? "");

  // Names: the header rows above the first section ("基本参数"): version, cab, battery.
  const firstSection = g.findIndex((row) => /基本参数/.test(row[0]));
  const headRows = g.slice(0, firstSection < 0 ? 4 : firstSection).filter((row) => /配置版本|^项目$|驾驶室|电池电量/.test(row[0]));
  let names = cols.map((_, i) => headRows.filter((row) => !/电池电量|驾驶室/.test(row[0])).map((row) => trimName(cells(row)[i])).filter(Boolean)
    .filter((part, k, list) => list.indexOf(part) === k).join(" · "));

  const report: string[] = [];
  type Part = { part?: string; sub: string; cells: string[] };
  const entries = new Map<string, { key?: string; extra?: string; group?: string; parts: Part[] }>();
  for (const row of g.slice(firstSection < 0 ? 0 : firstSection)) {
    const label = row[0];
    const sub = labelCols > 1 && row[1] !== label ? row[1] : "";
    const values = cells(row);
    if (values.every((v) => !v || v === label)) continue; // section heading
    const rule = ruleFor(label);
    if (!rule) { report.push(`таниагүй мөр: ${label} = ${values[0]}`); continue; }
    if (rule.skip) continue;
    const id = rule.key ?? `extra:${rule.extra}`;
    const entry = entries.get(id) ?? { key: rule.key, extra: rule.extra, group: rule.group, parts: [] };
    entry.parts.push({ part: rule.part, sub: BODY[sub] ?? sub, cells: values });
    entries.set(id, entry);
  }

  const merge = (key: string, parts: Part[]) => {
    const plain = parts.filter((p) => !p.part);
    if (plain.length === 0) return undefined;
    return Array.from({ length: n }, (_, i) => {
      const list = plain.map((p) => ({ sub: p.sub, value: convert(key, p.cells[i]) }));
      if (new Set(list.map((item) => item.value)).size === 1 || list.every((item) => !item.sub)) return list.find((item) => item.value)?.value ?? "";
      return list.filter((item) => item.value).map((item) => `${item.sub}: ${item.value}`).join(" · ");
    });
  };
  const at = (parts: Part[], part: string) => parts.find((p) => p.part === part);

  const values: Record<string, string[]> = {};
  const extras: ExtraRow[] = [];
  const check = new Set<string>();
  for (const [, entry] of entries) {
    if (entry.extra) {
      const list = merge(entry.extra, entry.parts) ?? [];
      // A row that is "–" everywhere says nothing; untranslated text is reported instead of shown.
      if (!list.some((v) => v && v !== "–")) continue;
      if (list.some((v) => CJK.test(v))) { report.push(`орчуулаагүй нэмэлт мөр: ${entry.extra} = ${list[0]}`); continue; }
      extras.push({ group: entry.group ?? "general", label: entry.extra, values: list });
      continue;
    }
    const key = entry.key!, p = entry.parts;
    let list = merge(key, p);
    if (key === "size" && at(p, "l")) list = list ?? Array.from({ length: n }, (_, i) => ["l", "w", "h"].map((x) => at(p, x)?.cells[i] ?? "").join("×"));
    if (key === "track" && at(p, "front")) list = Array.from({ length: n }, (_, i) => [at(p, "front"), at(p, "rear")].map((x) => x?.cells[i] ?? "").filter(Boolean).join(" / "));
    if (key === "approach") list = Array.from({ length: n }, (_, i) => [at(p, "a"), at(p, "d")].map((x) => x?.cells[i] ?? "").filter(Boolean).join(" / "));
    if (key === "brakes" && at(p, "front")) {
      list = Array.from({ length: n }, (_, i) => {
        const [front, rear] = [at(p, "front"), at(p, "rear")].map((x) => translate(x?.cells[i] ?? ""));
        return front && rear ? (front === rear ? `Урд, хойд ${front}` : `Урд ${front}, хойд ${rear}`) : front || rear;
      });
    }
    if (key === "tyres" && at(p, "rear") && list) list = list.map((front, i) => { const rear = at(p, "rear")!.cells[i]; return rear && rear !== front ? `${front} / ${rear}` : front; });
    if (key === "usb" && (at(p, "usb") || at(p, "c"))) {
      list = Array.from({ length: n }, (_, i) => {
        const full = [at(p, "usb"), at(p, "c")].map((x) => x?.cells[i] ?? "").find((cell) => /66W/i.test(cell));
        if (full) return "1 Type-C (66W хурдан цэнэглэлт), 1 USB";
        const [u, c] = [at(p, "usb"), at(p, "c")].map((x) => (x?.cells[i] ?? "").replace(/个/g, "").trim());
        return [u && !isDash(u) ? `${u} USB` : "", c && !isDash(c) ? `${c} Type-C` : ""].filter(Boolean).join(", ");
      });
    }
    if (key === "engine_model") {
      const ext = p.find((x) => !x.part), eng = at(p, "engine");
      list = Array.from({ length: n }, (_, i) => {
        const [a, b] = [ext, eng].map((x) => (x?.cells[i] ?? "").trim()).map((v) => (isDash(v) ? "" : v));
        return a && b ? `${a} (${b} хөдөлгүүр)` : a || b;
      });
    }
    if (key === "range" && !values.range_std) {
      const label = [...g].find((row) => ruleFor(row[0])?.key === "range")?.[0] ?? "";
      const std = label.match(/CLTC|NEDC|WLTC|CHTC/i)?.[0];
      if (std) values.range_std = Array(n).fill(std.toUpperCase());
    }
    if (!list || values[key]) continue;
    values[key] = list;
    const field = FIELD[key];
    if (list.some((v) => CJK.test(v)) || (field && list.some((v) => checkValue(field, v)?.level === "error"))) check.add(key);
  }

  // Range extender: engine power and torque in one field ("70 кВт / 130 Н·м").
  const kw = extras.findIndex((e) => e.label.startsWith("Хөдөлгүүрийн чадал")), nm = extras.findIndex((e) => e.label.startsWith("Хөдөлгүүрийн эргэх момент"));
  const hasEngine = values.engine_model?.some((v) => v && v !== "–");
  if (kw >= 0 && hasEngine) values.engine_power = extras[kw].values.map((k, i) => [k && /\d/.test(k) && `${k} кВт`, nm >= 0 && /\d/.test(extras[nm].values[i] ?? "") && `${extras[nm].values[i]} Н·м`].filter(Boolean).join(" / "));
  for (const i of [kw, nm].filter((x) => x >= 0).sort((a, b) => b - a)) extras.splice(i, 1);
  if (!values.dc && values.dc_time?.some(Boolean)) values.dc = values.dc_time.map((v) => (v ? "●" : ""));
  if (!values.ac && values.ac_control?.some((v) => v && v !== "–")) values.ac = values.ac_control.map((v) => (v && v !== "–" ? "●" : ""));
  if (values.speakers) values.speakers = values.speakers.map((v) => v.replace(/个$/, ""));

  // Several columns with the same name (6- and 9-seat versions) → one configuration, "6 / 9".
  let keep = cols.map((_, i) => i);
  const join = (list: string[]) => [...new Set(list.filter(Boolean))].join(" / ");
  if (opts.merge) {
    const groups = new Map<string, number[]>();
    names.forEach((name, i) => groups.set(name, [...(groups.get(name) ?? []), i]));
    keep = [...groups.values()].map((list) => list[0]);
    for (const list of Object.values(values)) {
      for (const idx of groups.values()) list[idx[0]] = join(idx.map((i) => list[i]));
    }
    for (const extra of extras) for (const idx of groups.values()) extra.values[idx[0]] = join(idx.map((i) => extra.values[i]));
  }
  // Same name left (EC31L: two flatbed products) → add the battery.
  if (new Set(keep.map((i) => names[i])).size < keep.length && values.battery_kwh) names = names.map((name, i) => `${name} · ${values.battery_kwh[i]} кВт·ц`);
  const pick = (list: string[]) => keep.map((i) => list[i] ?? "");
  const prefix = opts.prefix ? `${opts.prefix} · ` : "";

  const sheet: SpecSheet = {
    configs: keep.map((i, k) => ({ name: `${prefix}${names[i] || `Тохиргоо ${k + 1}`}`, sold: !opts.unsold?.includes(k + 1) })),
    values: Object.fromEntries(Object.entries(values).map(([key, list]) => [key, pick(list)]).filter(([, list]) => (list as string[]).some(Boolean))),
    extras: extras.filter((e) => GROUPS.some((g) => g.key === e.group)).map((e) => ({ ...e, values: pick(e.values) })),
    check: [...check],
    source: `rc-ev.com · ${opts.page} · ${new Date().toISOString().slice(0, 10)}`
  };
  report.unshift(`${opts.page}: ${sheet.configs.length} тохиргоо, ${Object.keys(sheet.values).length} үзүүлэлт, ${sheet.extras.length} нэмэлт мөр, шалгах: ${sheet.check?.join(", ") || "—"}`);
  return { sheet, report };
}

/** Two pages of one model (EC75 / R5 cargo + passenger) → one sheet; each side's names carry its prefix. */
export function combine(a: SpecSheet, b: SpecSheet, source: string): SpecSheet {
  const keys = [...new Set([...Object.keys(a.values), ...Object.keys(b.values)])];
  const fill = (s: SpecSheet, key: string) => s.values[key] ?? s.configs.map(() => "");
  const labels = [...new Set([...a.extras, ...b.extras].map((e) => `${e.group}|${e.label}`))];
  return {
    configs: [...a.configs, ...b.configs],
    values: Object.fromEntries(keys.map((key) => [key, [...fill(a, key), ...fill(b, key)]])),
    extras: labels.map((id) => {
      const [group, label] = id.split("|");
      const of = (s: SpecSheet) => s.extras.find((e) => e.group === group && e.label === label)?.values ?? s.configs.map(() => "");
      return { group, label, values: [...of(a), ...of(b)] };
    }),
    check: [...new Set([...(a.check ?? []), ...(b.check ?? [])])],
    source
  };
}

if (process.argv[1]?.endsWith("import-rcev.mts")) {
  const [input, output, ...flags] = process.argv.slice(2);
  const flag = (name: string) => { const i = flags.indexOf(`--${name}`); return i >= 0 ? flags[i + 1] : undefined; };
  const list = (name: string) => flag(name)?.split(",").map(Number);
  const { sheet, report } = importPage(readFileSync(input, "utf8"), {
    page: flag("page") ?? input, cols: list("cols"), prefix: flag("prefix"), merge: flags.includes("--merge"), unsold: list("unsold")
  });
  writeFileSync(output, JSON.stringify(sheet, null, 1));
  console.log(report.join("\n"));
}
