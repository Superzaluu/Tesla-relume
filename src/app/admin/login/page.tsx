import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AdminInputs";
import { getAdmin } from "@/lib/supabase-auth";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Admin — нэвтрэх", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const admin = await getAdmin();
  if (admin.isAdmin) redirect("/admin/");

  return (
    <main className="tw flex min-h-screen items-start justify-center bg-[#f5f7fa] px-4 pb-24 pt-[calc(var(--navbar-height)+64px)]">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-[0_10px_30px_rgb(15_35_56/.08)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#147a48]">Ruichi admin</p>
        <h1 className="mb-6 mt-1 text-[28px] font-bold text-ink">Нэвтрэх</h1>
        <LoginForm initialError={error ?? (admin.user ? "Энэ бүртгэлд засах эрх алга." : undefined)} />
        {admin.user && (
          <form action={signOut} className="mt-4 text-center">
            <button type="submit" className="text-small text-ink-muted underline">{admin.user.email}-ээс гарах</button>
          </form>
        )}
      </div>
    </main>
  );
}
