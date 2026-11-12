// Server-only Supabase reader (PostgREST over fetch, no client library).
// Responses are cached by Next.js and refreshed at most every REVALIDATE
// seconds, so edits in the Supabase dashboard appear on the site within a minute.

export const REVALIDATE = 60;

export async function select<T>(table: string, query: string): Promise<T[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL болон SUPABASE_PUBLISHABLE_KEY тохируулаагүй байна. " +
        "Локалд .env.local файлд, Vercel дээр Settings → Environment Variables хэсэгт нэмнэ үү (.env.example-ийг харна уу)."
    );
  }
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: key },
    next: { revalidate: REVALIDATE, tags: ["content"] }
  });
  if (!res.ok) throw new Error(`Supabase "${table}" уншихад алдаа гарлаа: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T[]>;
}
