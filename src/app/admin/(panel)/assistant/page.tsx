import { Notice } from "@/components/admin/AdminUi";
import { requireAdmin } from "@/lib/supabase-auth";
import { answerQuestion, deleteKnowledge, dismissQuestion, saveKnowledge } from "../../assistant-actions";

// «AI туслах» admin (user test #1, 2026-11-23, item 10).
// 1. Questions the assistant could not answer from the site's data — answer them (and teach the assistant).
// 2. Recent questions it did answer — check them, correct by adding a knowledge entry.
// 3. The knowledge itself — edit, switch off, delete, add.

type Question = { id: string; created_at: string; question: string; ai_answer: string | null; status: string; page: string | null; contact: string | null; admin_answer: string | null };
type Knowledge = { id: string; question: string; answer: string; active: boolean; updated_at: string };

const date = (iso: string) =>
  new Intl.DateTimeFormat("mn-MN", { timeZone: "Asia/Ulaanbaatar", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const box = "rounded-2xl border border-line bg-white";
const field = "w-full rounded-lg border border-line bg-white px-3 py-2 text-small text-ink";
const button = "rounded-lg bg-[#0f5a3a] px-4 py-2 text-small font-semibold text-white hover:bg-[#083d28]";
const ghost = "rounded-lg border border-line px-3 py-2 text-small text-ink hover:bg-[#f1f3f5]";

function AnswerForm({ q, label }: { q: Question; label: string }) {
  return (
    <form action={answerQuestion} className="mt-3 grid gap-2">
      <input type="hidden" name="id" value={q.id} />
      <textarea name="answer" rows={3} required className={field} placeholder="Хариулт (хэрэглэгч туслах дээрээс харна, мэдлэгт нэмбэл AI дахин ашиглана)" defaultValue={q.admin_answer ?? ""} />
      <label className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
        <input type="checkbox" name="learn" defaultChecked /> Мэдлэгийн санд нэмэх, асуултыг ингэж бичнэ:
        <input name="question" defaultValue={q.question} className={`${field} max-w-[420px] py-1 text-xs`} />
      </label>
      <div><button type="submit" className={button}>{label}</button></div>
    </form>
  );
}

export default async function AssistantAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const { supabase } = await requireAdmin();
  const [open, recent, knowledge] = await Promise.all([
    supabase.from("assistant_questions").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(100),
    supabase.from("assistant_questions").select("*").in("status", ["ai", "admin"]).order("created_at", { ascending: false }).limit(30),
    supabase.from("assistant_knowledge").select("*").order("updated_at", { ascending: false }).limit(300)
  ]);
  const missing = open.error?.message.includes("assistant_questions") || knowledge.error?.message.includes("assistant_knowledge");
  const openRows = (open.data ?? []) as Question[];
  const recentRows = (recent.data ?? []) as Question[];
  const knowledgeRows = (knowledge.data ?? []) as Knowledge[];

  return (
    <>
      <h1 className="text-[32px] font-bold tracking-tight text-ink">AI туслах</h1>
      <p className="mb-6 mt-1 max-w-[80ch] text-small text-ink-secondary">
        Сайтын AI туслах (ChatGPT) зөвхөн сайтын мэдээлэл болон доорх мэдлэгийн сангаар хариулна. Хариулж чадаагүй асуулт энд ирнэ.
        Хариулаад «Мэдлэгийн санд нэмэх»-ийг сонговол дараагийн хүнд AI өөрөө хариулна.
      </p>
      <Notice error={error} saved={saved ? "Хадгаллаа." : undefined} />
      {missing && (
        <p className="mb-6 rounded-xl bg-[#fff4d6] px-4 py-3 text-small text-[#8a5a00]">
          Хүснэгт үүсээгүй байна: supabase/migrations/0020_assistant.sql-ийг Supabase дээр ажиллуулна уу.
        </p>
      )}

      <h2 className="mb-3 text-[20px] font-bold text-ink">Хариулаагүй асуулт <span className="text-ink-muted">{openRows.length}</span></h2>
      {openRows.length === 0 ? (
        <p className={`${box} mb-10 px-5 py-6 text-center text-small text-ink-muted`}>Хариулах асуулт алга.</p>
      ) : (
        <ul className={`${box} mb-10 list-none divide-y divide-line p-0`}>
          {openRows.map((q) => (
            <li key={q.id} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="m-0 font-semibold text-ink">{q.question}</p>
                <span className="text-xs text-ink-muted">{date(q.created_at)}{q.page ? ` · ${q.page}` : ""}</span>
              </div>
              {q.contact && <p className="m-0 mt-1 text-small font-semibold text-[#0f5a3a]">Холбоо барих: {q.contact}</p>}
              {q.ai_answer && <p className="m-0 mt-1 text-xs text-ink-muted">AI: {q.ai_answer}</p>}
              <AnswerForm q={q} label="Хариулах" />
              <form action={dismissQuestion} className="mt-2"><input type="hidden" name="id" value={q.id} /><button type="submit" className={ghost}>Асуулт биш — хаах</button></form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 text-[20px] font-bold text-ink">Сүүлд хариулсан асуулт</h2>
      <p className="mb-3 text-small text-ink-secondary">AI-ийн хариулт буруу эсвэл дутуу бол засварласан хариултаа бичээд мэдлэгт нэмээрэй.</p>
      <ul className={`${box} mb-10 list-none divide-y divide-line p-0`}>
        {recentRows.length === 0 && <li className="px-5 py-6 text-center text-small text-ink-muted">Одоохондоо алга.</li>}
        {recentRows.map((q) => (
          <li key={q.id} className="px-5 py-4">
            <details>
              <summary className="cursor-pointer">
                <span className="font-semibold text-ink">{q.question}</span>
                <span className="ml-2 text-xs text-ink-muted">{date(q.created_at)} · {q.status === "admin" ? "ажилтан" : "AI"}</span>
              </summary>
              <p className="m-0 mt-2 whitespace-pre-line text-small text-ink-secondary">{q.admin_answer ?? q.ai_answer}</p>
              <AnswerForm q={q} label="Засаж хадгалах" />
            </details>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 text-[20px] font-bold text-ink">Мэдлэгийн сан <span className="text-ink-muted">{knowledgeRows.length}</span></h2>
      <form action={saveKnowledge} className={`${box} mb-4 grid gap-2 p-5`}>
        <p className="m-0 font-semibold text-ink">Шинэ мэдлэг нэмэх</p>
        <input name="question" required className={field} placeholder="Асуулт, жишээ нь: Засвар үйлчилгээний төв хаана байдаг вэ?" />
        <textarea name="answer" required rows={3} className={field} placeholder="Хариулт" />
        <label className="flex items-center gap-2 text-xs text-ink-secondary"><input type="checkbox" name="active" defaultChecked /> Идэвхтэй</label>
        <div><button type="submit" className={button}>Нэмэх</button></div>
      </form>
      <ul className="m-0 grid list-none gap-3 p-0">
        {knowledgeRows.map((k) => (
          <li key={k.id} className={`${box} p-5 ${k.active ? "" : "opacity-60"}`}>
            <form action={saveKnowledge} className="grid gap-2">
              <input type="hidden" name="id" value={k.id} />
              <input name="question" defaultValue={k.question} className={`${field} font-semibold`} />
              <textarea name="answer" rows={3} defaultValue={k.answer} className={field} />
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-ink-secondary"><input type="checkbox" name="active" defaultChecked={k.active} /> Идэвхтэй</label>
                <button type="submit" className={button}>Хадгалах</button>
                <span className="text-xs text-ink-muted">{date(k.updated_at)}</span>
              </div>
            </form>
            <form action={deleteKnowledge} className="mt-2"><input type="hidden" name="id" value={k.id} /><button type="submit" className={ghost}>Устгах</button></form>
          </li>
        ))}
      </ul>
    </>
  );
}
