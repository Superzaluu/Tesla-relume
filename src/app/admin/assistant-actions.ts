"use server";
// /admin/assistant/ (user test #1, 2026-11-23, item 10): answer the questions the AI could not, add the answers to
// the assistant's knowledge, and improve that knowledge. Runs with the admin's session (Row Level Security).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-auth";

const BACK = "/admin/assistant/";
const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};
function fail(message: string): never { redirect(`${BACK}?error=${encodeURIComponent(message)}`); }
function done(): never { revalidatePath(BACK); redirect(`${BACK}?saved=1`); }

/** Answer a question; optionally add it (question as edited) to the knowledge. */
export async function answerQuestion(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(form, "id");
  const answer = text(form, "answer");
  if (!id || answer.length < 2) fail("Хариултаа бичнэ үү.");
  const { error } = await supabase.from("assistant_questions").update({ admin_answer: answer, status: "admin", answered_at: new Date().toISOString() }).eq("id", id);
  if (error) fail(`Хадгалахад алдаа гарлаа: ${error.message}`);
  if (form.get("learn") === "on") {
    const question = text(form, "question");
    const { error: learnError } = await supabase.from("assistant_knowledge").insert({ question: question || "—", answer, source_question: id });
    if (learnError) fail(`Мэдлэгт нэмэхэд алдаа гарлаа: ${learnError.message}`);
  }
  done();
}

export async function dismissQuestion(form: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("assistant_questions").update({ status: "dismissed" }).eq("id", text(form, "id"));
  if (error) fail(error.message);
  done();
}

/** Add or edit a knowledge entry ("id" empty = new). */
export async function saveKnowledge(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(form, "id");
  const row = { question: text(form, "question"), answer: text(form, "answer"), active: form.get("active") === "on", updated_at: new Date().toISOString() };
  if (row.question.length < 2 || row.answer.length < 1) fail("Асуулт, хариултаа бөглөнө үү.");
  const { error } = id
    ? await supabase.from("assistant_knowledge").update(row).eq("id", id)
    : await supabase.from("assistant_knowledge").insert(row);
  if (error) fail(`Хадгалахад алдаа гарлаа: ${error.message}`);
  done();
}

export async function deleteKnowledge(form: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("assistant_knowledge").delete().eq("id", text(form, "id"));
  if (error) fail(error.message);
  done();
}
