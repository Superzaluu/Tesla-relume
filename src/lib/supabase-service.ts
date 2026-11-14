// Server-only PostgREST calls with the service role key (bypasses Row Level Security).
// Used only where no admin is logged in but the server must update data it verified itself:
// the Byl webhook and the payment return page. Env: SUPABASE_SERVICE_ROLE_KEY (never NEXT_PUBLIC_).

type Method = "GET" | "PATCH" | "POST";

export const serviceConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function serviceRest<T>(method: Method, path: string, body?: unknown, prefer?: string): Promise<T[] | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      // Legacy service_role keys are JWTs and go in Authorization too; new "sb_secret_…" keys only in apikey.
      ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
      "Content-Type": "application/json",
      Prefer: prefer ?? "return=representation"
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store"
  });
  if (!res.ok) {
    console.error("Supabase service request failed", method, path.split("?")[0], res.status, (await res.text()).slice(0, 300));
    return null;
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T[]) : [];
}
