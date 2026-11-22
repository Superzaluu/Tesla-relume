// «AI туслах» (user test #1, 2026-11-23, item 10). Server only.
//
// Answers with ChatGPT (OpenAI, env OPENAI_API_KEY, model env OPENAI_MODEL) from this site's own data only:
// the models, their key specs, prices, charging, warranty, green loan, pre-order and the admin's knowledge
// entries (assistant_knowledge). A question it cannot answer from that is logged as 'open' for an admin
// (/admin/assistant/); the admin's answer can go into the knowledge, so the next visitor gets it.
import { randomUUID } from "node:crypto";
import { BRAND_FACTS, BRAND_TIMELINE, brandName } from "@/data/brand";
import { getModel, getNavigation, getSpecSheet } from "@/data/content";
import { MAX_TERM, MIN_DOWN_PERCENT, RATE_TIERS } from "@/data/greenLoan";
import { BONUS_AMOUNT, DEPOSIT_REFUND_DAYS } from "@/data/preorder";
import { PRIZES } from "@/data/prizes";
import { ELECTRICITY_PRICE } from "@/data/savings";
import { DEALER_WARRANTY, FIELD, onSite } from "@/data/specSheet";
import { select } from "@/lib/supabase";
import { insertPublic } from "@/lib/preorders";
import { serviceRest } from "@/lib/supabase-service";

/** Spec fields told to the assistant, in this order. */
const SPEC_KEYS = [
  "range", "battery_kwh", "dc_time", "ac_time", "ac_power", "power", "torque", "top_speed", "payload", "cargo_volume", "cargo_size",
  "seats", "size", "drive", "total_range", "engine_model", "battery_heating", "v2l", "aeb", "acc", "camera360", "rear_camera"
];

const unique = (values: string[]) => [...new Set(values.map((v) => v.trim()).filter((v) => v && v !== "–"))];

async function modelsText(): Promise<string> {
  const navigation = await getNavigation();
  const lines: string[] = [];
  const seen = new Set<string>();
  for (const category of navigation) {
    for (const item of category.items) {
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      const [model, sheet] = await Promise.all([getModel(item.slug), getSpecSheet(item.slug).catch(() => null)]);
      const parts = [`## ${brandName(item.name)} (${category.label}) — ${item.desc}`, `Хуудас: /models/${item.slug}/`];
      if (item.priceFrom) parts.push(`Эхлэх үнэ: ${item.priceFrom.toLocaleString("en-US")} ₮`);
      if (model?.quick) {
        const q = model.quick;
        parts.push(`Түлш: ${q.fuel}; хөтлөгч: ${q.drive}; туулах зай: ${q.range || q.evRange || "—"}; хурдан цэнэглэлт: ${q.fastCharge ?? q.charge}; хэмжээ: ${q.size}; суудал: ${q.seats}; даац: ${q.payload}`);
      }
      if (sheet) {
        const cols = sheet.configs.map((_, i) => i).filter((i) => onSite(sheet, i));
        const trims = cols.map((i) => `${sheet.configs[i].name}${sheet.configs[i].price ? ` ${sheet.configs[i].price!.toLocaleString("en-US")} ₮` : ""}`);
        if (trims.length) parts.push(`Иж бүрдэл: ${trims.join("; ")}`);
        for (const key of SPEC_KEYS) {
          const field = FIELD[key];
          const values = unique(cols.map((i) => sheet.values[key]?.[i] ?? ""));
          if (field && values.length) parts.push(`${field.label}${field.unit ? ` (${field.unit})` : ""}: ${values.join(" / ")}`);
        }
      }
      lines.push(parts.join("\n"));
    }
  }
  return lines.join("\n\n");
}

function siteText(): string {
  const rates = RATE_TIERS.map((tier) => `${tier.label}: сарын ${tier.monthly}% (жилийн ${tier.annual}%)`).join("; ");
  return [
    "# Ruichi брэнд",
    ...BRAND_FACTS.map((fact) => `- ${fact.value} ${fact.label}: ${fact.text}`),
    ...BRAND_TIMELINE.map((item) => `- ${item.year}: ${item.title}. ${item.text}`),
    "Дэлгэрэнгүй: /brand/",
    "# Баталгаа",
    `Батерейн баталгаа: ${DEALER_WARRANTY} (Монгол дахь дилерийн нөхцөл). Дэлгэрэнгүй: /warranty/`,
    "# Ногоон зээл (Хаан банк)",
    `${rates}. Урьдчилгаа ${MIN_DOWN_PERCENT}%-иас, хугацаа цалингийн орлоготой ${MAX_TERM.salary} сар, бизнесийн орлоготой ${MAX_TERM.business} сар хүртэл. Тооцоолуур: /green-loan/`,
    "# Урьдчилсан захиалга",
    `Захиалга: /preorder/. Зарим загварт онлайн урьдчилгаа Byl-ээр (QPay, карт, шилжүүлэг); цуцалбал ${DEPOSIT_REFUND_DAYS} хоногт буцаана.`,
    `${BONUS_AMOUNT.toLocaleString("en-US")} ₮ бонус: /register/-д бүртгүүлсэн утсаар захиалбал машины үнээс хасна.`,
    `Захиалсны дараа азын хүрд эргүүлж нэг шагнал заавал хожно: ${PRIZES.map((p) => p.label).join(", ")}. Шагналаа машинаа хүлээн авахдаа авна.`,
    "# Бусад",
    `Хэмнэлтийн тооцоолуур: /savings/ (цахилгааныг ${ELECTRICITY_PRICE} ₮/кВт·ц гэж тооцно). Туршилтын жолоодлого: нүүр хуудасны «Туршилтын жолоодлого» товчоор цаг захиална. Цэнэглэх станцын газрын зураг: /#chargers`
  ].join("\n");
}

type Knowledge = { question: string; answer: string };
async function knowledgeText(): Promise<string> {
  try {
    const rows = await select<Knowledge>("assistant_knowledge", "select=question,answer&active=eq.true&order=updated_at.desc&limit=200");
    return rows.map((row) => `Асуулт: ${row.question}\nХариулт: ${row.answer}`).join("\n\n");
  } catch {
    return ""; // table not created yet (migration 0020)
  }
}

// The site data changes rarely: build it at most every 10 minutes per server instance.
let cached: { at: number; text: string } | null = null;
export async function knowledge(): Promise<string> {
  if (cached && Date.now() - cached.at < 10 * 60_000) return cached.text;
  const [models, extra] = await Promise.all([modelsText(), knowledgeText()]);
  const text = `${siteText()}\n\n# Загварууд\n${models}${extra ? `\n\n# Админы баталгаажуулсан хариултууд (эдгээрийг давуу эрхтэй ашигла)\n${extra}` : ""}`;
  cached = { at: Date.now(), text };
  return text;
}

const SYSTEM = (data: string, page: string) => `Чи бол Монгол дахь Ruichi цахилгаан машины албан ёсны сайтын туслах.
Дүрэм:
- Зөвхөн доорх МЭДЭЭЛЭЛ-д байгаа баримтаар хариул. Үнэ, үзүүлэлт, хугацаа, нөхцөлийг хэзээ ч зохиож болохгүй.
- Монгол кирилл үсгээр, найрсаг, товч (ихдээ 120 үг) хариул. Холбогдох хуудасны замыг (жишээ нь /models/c5/) дурдаж болно.
- Хэрэглэгч ${page ? `одоо ${page} хуудсанд байна; «энэ машин» гэвэл тэр хуудасны загварыг хэлнэ` : "сайтад байна"}.
- МЭДЭЭЛЭЛ-д хариулт байхгүй бол found=false болгож, «Энэ талаар манай ажилтан тодруулж хариулна» гэсэн утгатай товч хариулт өг.
- Сайттай холбоогүй асуултад (улс төр, гэрийн даалгавар гэх мэт) found=true, «Би зөвхөн Ruichi машины талаар тусална» гэж хариул.
- Зөвхөн JSON буцаа: {"answer": "...", "found": true|false}

МЭДЭЭЛЭЛ:
${data}`;

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AssistantReply = { answer: string; found: boolean; questionId?: string; mode: "ai" | "offline" };

export async function ask(messages: ChatMessage[], page: string): Promise<AssistantReply> {
  const question = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const key = process.env.OPENAI_API_KEY;
  let reply: AssistantReply;
  if (!key) {
    // Test mode without a key: every question goes to the admin.
    reply = { answer: "AI туслах одоогоор тест горимд байна. Таны асуултыг манай ажилтанд илгээлээ, удахгүй хариулна.", found: false, mode: "offline" };
  } else {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 500,
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: SYSTEM(await knowledge(), page) }, ...messages.slice(-8)]
        }),
        cache: "no-store"
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status} ${(await res.text()).slice(0, 200)}`);
      const data = await res.json() as { choices?: { message?: { content?: string } }[] };
      const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as { answer?: string; found?: boolean };
      reply = { answer: String(parsed.answer ?? "").slice(0, 2000) || "Уучлаарай, хариулж чадсангүй.", found: parsed.found !== false, mode: "ai" };
    } catch (error) {
      console.error("[assistant]", error);
      reply = { answer: "Уучлаарай, туслах түр ажиллахгүй байна. Таны асуултыг манай ажилтанд илгээлээ.", found: false, mode: "offline" };
    }
  }
  // Every question is logged; the unanswered ones wait for an admin.
  const id = randomUUID();
  const logged = await insertPublic("assistant_questions", {
    id, question: question.slice(0, 1000), ai_answer: reply.answer.slice(0, 4000), status: reply.found ? "ai" : "open", page: page.slice(0, 300) || null
  }).catch(() => false);
  return { ...reply, questionId: logged && !reply.found ? id : undefined };
}

/** The visitor's phone / e-mail for an open question, so the admin can answer them (service role). */
export async function attachContact(id: string, contact: string) {
  return serviceRest("PATCH", `assistant_questions?id=eq.${id}&status=eq.open&contact=is.null`, { contact: contact.slice(0, 160) }, "return=minimal");
}
