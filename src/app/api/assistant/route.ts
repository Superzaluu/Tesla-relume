// «AI туслах» endpoint (user test #1, 2026-11-23, item 10).
//   POST { messages, page }          → { answer, found, questionId? }
//   POST { contact, questionId }     → { ok }   (phone / e-mail for a question sent to the admin)
//   GET  ?ids=uuid,uuid              → { answers: { id, answer }[] }  (admin answers to the visitor's open questions)
import { NextResponse } from "next/server";
import { ask, attachContact, knowledge, type ChatMessage } from "@/lib/assistant";
import { serviceRest } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Best-effort limit per server instance: 20 questions per visitor per 10 minutes.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 20;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { messages?: unknown; page?: unknown; contact?: unknown; questionId?: unknown } | null;
  if (!body) return NextResponse.json({ error: "Буруу хүсэлт" }, { status: 400 });

  if (typeof body.contact === "string" && typeof body.questionId === "string") {
    if (!UUID.test(body.questionId) || body.contact.trim().length < 6) return NextResponse.json({ ok: false }, { status: 400 });
    const saved = await attachContact(body.questionId, body.contact.trim());
    return NextResponse.json({ ok: saved !== null });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ answer: "Түр хүлээгээд дахин асуугаарай.", found: true }, { status: 429 });

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m): m is ChatMessage => typeof m === "object" && m !== null && ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") && typeof (m as ChatMessage).content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    .slice(-10);
  if (!messages.length || messages.at(-1)?.role !== "user" || !messages.at(-1)!.content.trim()) {
    return NextResponse.json({ error: "Асуултаа бичнэ үү" }, { status: 400 });
  }
  const page = typeof body.page === "string" ? body.page.slice(0, 300) : "";
  return NextResponse.json(await ask(messages, page));
}

export async function GET(request: Request) {
  // Local check of what the assistant is told (never in production).
  if (process.env.NODE_ENV !== "production" && new URL(request.url).searchParams.get("debug") === "knowledge") {
    return new NextResponse(await knowledge(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const ids = (new URL(request.url).searchParams.get("ids") ?? "").split(",").filter((id) => UUID.test(id)).slice(0, 10);
  if (!ids.length) return NextResponse.json({ answers: [] });
  const rows = await serviceRest<{ id: string; admin_answer: string | null }>(
    "GET", `assistant_questions?id=in.(${ids.join(",")})&status=eq.admin&select=id,admin_answer`
  );
  return NextResponse.json({ answers: (rows ?? []).filter((row) => row.admin_answer).map((row) => ({ id: row.id, answer: row.admin_answer })) });
}
