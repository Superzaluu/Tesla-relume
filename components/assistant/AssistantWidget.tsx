"use client";
// «AI туслах» on every page (user test #1, 2026-11-23, item 10): a round button bottom-left opens a chat panel.
// Answers come from /api/assistant (ChatGPT on this site's data only). A question it cannot answer goes to the
// admin; the visitor may leave a phone / e-mail, and the admin's answer shows here the next time the panel opens.
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string; forwarded?: string; admin?: boolean };

const STORE = "ruichi-assistant";
const SUGGESTIONS = [
  "Гэртээ хэдэн цагт цэнэглэх вэ?",
  "Баталгаа хэдэн жил вэ?",
  "Ногоон зээлийн нөхцөл ямар вэ?",
  "Ачааны фургоноос аль нь тохирох вэ?"
];
const GREETING: Message = {
  role: "assistant",
  content: "Сайн байна уу! Би Ruichi-ийн AI туслах. Загвар, үзүүлэлт, үнэ, цэнэглэлт, зээл, баталгааны талаар асуугаарай."
};

type Saved = { messages: Message[]; pending: string[] };
const load = (): Saved => {
  try { return JSON.parse(sessionStorage.getItem(STORE) ?? "") as Saved; } catch { return { messages: [GREETING], pending: [] }; }
};

export function AssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [pending, setPending] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [contactFor, setContactFor] = useState<string | null>(null);
  const [contact, setContact] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { const saved = load(); if (saved.messages?.length) setMessages(saved.messages); setPending(saved.pending ?? []); }, []);
  useEffect(() => { try { sessionStorage.setItem(STORE, JSON.stringify({ messages: messages.slice(-30), pending })); } catch { /* storage blocked */ } }, [messages, pending]);
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [messages, open, busy]);
  useEffect(() => { if (open) field.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Answers the admin has given to this visitor's forwarded questions.
  useEffect(() => {
    if (!open || pending.length === 0) return;
    fetch(`/api/assistant/?ids=${pending.join(",")}`).then((res) => res.json()).then((data: { answers?: { id: string; answer: string }[] }) => {
      const answers = data.answers ?? [];
      if (!answers.length) return;
      setMessages((list) => [...list, ...answers.map((a) => ({ role: "assistant" as const, content: a.answer, admin: true }))]);
      setPending((ids) => ids.filter((id) => !answers.some((a) => a.id === id)));
    }).catch(() => {});
  }, [open, pending]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname, messages: next.filter((m) => !m.forwarded).map(({ role, content }) => ({ role, content })) })
      });
      const data = await res.json() as { answer?: string; found?: boolean; questionId?: string };
      setMessages([...next, { role: "assistant", content: data.answer ?? "Уучлаарай, хариулж чадсангүй.", forwarded: data.questionId }]);
      if (data.questionId) { setPending((ids) => [...ids, data.questionId!].slice(-10)); setContactFor(data.questionId); }
    } catch {
      setMessages([...next, { role: "assistant", content: "Холболт тасарлаа. Дахин оролдоно уу." }]);
    } finally {
      setBusy(false);
    }
  };

  const sendContact = async () => {
    if (!contactFor || contact.trim().length < 6) return;
    await fetch("/api/assistant/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: contactFor, contact }) }).catch(() => {});
    setMessages((list) => [...list, { role: "assistant", content: `Баярлалаа! Хариуг ${contact.trim()} руу мэдэгдэнэ.` }]);
    setContactFor(null);
    setContact("");
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <button
        type="button" className={`aiw-fab${open ? " is-open" : ""}`} aria-expanded={open} aria-controls="aiw-panel"
        onClick={() => setOpen(!open)}
      >
        <span className="aiw-fab__icon" aria-hidden="true">
          {open ? "×" : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z" />
              <path d="M12 6.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="currentColor" stroke="none" />
            </svg>
          )}
        </span>
        <span className="aiw-fab__label">{open ? "Хаах" : "AI туслах"}</span>
      </button>

      <section id="aiw-panel" className={`aiw-panel${open ? " is-open" : ""}`} role="dialog" aria-label="AI туслах" aria-hidden={!open} inert={!open}>
        <header className="aiw-panel__head">
          <span className="aiw-panel__avatar" aria-hidden="true">AI</span>
          <div>
            <p className="aiw-panel__title">Ruichi AI туслах</p>
            <p className="aiw-panel__sub">Энэ сайтын мэдээллээр хариулна</p>
          </div>
          <button type="button" className="aiw-panel__close" aria-label="Хаах" onClick={() => setOpen(false)}>×</button>
        </header>

        <div className="aiw-list" ref={list} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`aiw-msg is-${m.role}${m.admin ? " is-admin" : ""}`}>
              {m.admin && <span className="aiw-msg__tag">Ажилтны хариулт</span>}
              {m.content}
              {m.forwarded && <span className="aiw-msg__tag is-forwarded">Ажилтанд илгээсэн</span>}
            </div>
          ))}
          {busy && <div className="aiw-msg is-assistant is-typing" aria-label="Бичиж байна"><i /><i /><i /></div>}
          {messages.length <= 1 && !busy && (
            <div className="aiw-suggest">
              {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}
            </div>
          )}
          {contactFor && (
            <form className="aiw-contact" onSubmit={(e) => { e.preventDefault(); sendContact(); }}>
              <label htmlFor="aiw-contact">Хариуг хүлээн авах утас эсвэл и-мэйл (заавал биш)</label>
              <div>
                <input id="aiw-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="9911 2233 эсвэл name@mail.mn" maxLength={160} />
                <button type="submit" className="btn btn--primary">Илгээх</button>
              </div>
            </form>
          )}
        </div>

        <form className="aiw-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <textarea
            ref={field} rows={1} value={input} maxLength={1000} placeholder="Асуултаа бичнэ үү…" aria-label="Асуулт"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          />
          <button type="submit" className="aiw-form__send" disabled={busy || !input.trim()} aria-label="Илгээх">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z" fill="currentColor" /></svg>
          </button>
        </form>
      </section>
    </>
  );
}
