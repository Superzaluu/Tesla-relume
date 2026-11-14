import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/supabase-auth";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Admin — Ruichi", robots: { index: false } };

const links = [
  { href: "/admin/", label: "Хяналт" },
  { href: "/admin/cards/", label: "Машины карт" },
  { href: "/admin/hero/", label: "Hero слайд" },
  { href: "/admin/preorders/", label: "Урьдчилсан захиалга" }
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <main className="tw min-h-screen bg-[#f5f7fa] pb-24 pt-[var(--navbar-height)]">
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 lg:px-8">
          <span className="text-small font-bold text-ink">Ruichi admin</span>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-3 py-1.5 text-small font-medium text-ink-secondary hover:bg-[#f1f3f5] hover:text-ink">
                {link.label}
              </Link>
            ))}
            <a href="/" target="_blank" className="rounded-lg px-3 py-1.5 text-small font-medium text-ink-secondary hover:bg-[#f1f3f5] hover:text-ink">Сайт харах ↗</a>
          </nav>
          <form action={signOut} className="ml-auto flex items-center gap-3">
            <span className="text-xs text-ink-muted">{user?.email}</span>
            <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-small text-ink hover:bg-[#f1f3f5]">Гарах</button>
          </form>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-5 pt-8 lg:px-8">{children}</div>
    </main>
  );
}
