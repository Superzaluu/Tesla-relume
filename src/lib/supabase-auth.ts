// Supabase client bound to the visitor's login cookies (used by /admin).
// Writes go through Row Level Security: only users listed in public.admins may edit.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function supabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL болон SUPABASE_PUBLISHABLE_KEY тохируулаагүй байна (.env.example-ийг харна уу).");
  return { url, key };
}

export async function createSupabaseServer() {
  const { url, key } = supabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a server component: cookies are refreshed by the middleware instead.
        }
      }
    }
  });
}

/** The signed-in user and whether they may edit content. */
export async function getAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data } = await supabase.rpc("is_admin");
  return { supabase, user, isAdmin: data === true };
}

/** For admin pages and actions: sends visitors without admin rights to the login page. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin.user) redirect("/admin/login/");
  if (!admin.isAdmin) redirect("/admin/login/?error=" + encodeURIComponent("Энэ бүртгэлд засах эрх алга."));
  return admin;
}
