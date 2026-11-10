"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navigation } from "@/data/navigation";

export function SiteHeader() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => { const onScroll = () => setSolid(window.scrollY > 16); onScroll(); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <header className={`fixed inset-x-0 top-0 z-40 border-b transition ${solid || open || mobile ? "border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur" : "border-transparent bg-gradient-to-b from-slate-950/70 to-transparent text-white"}`}>
    <div className="page-shell flex min-h-16 items-center justify-between gap-4">
      <Link href="/" aria-label="Нүүр хуудас"><Image src="/assets/brand-logo-transparent.png" alt="Tesla" width={57} height={36} className={solid || open || mobile ? "" : "brightness-0 invert"} /></Link>
      <nav className="hidden xl:flex xl:items-center xl:gap-1" aria-label="Загварууд">
        {navigation.map((group) => <div className="relative" key={group.label} onMouseEnter={() => setOpen(group.label)} onMouseLeave={() => setOpen(null)}>
          <button className="focus-ring rounded-lg px-2 py-3 text-sm font-medium" aria-expanded={open === group.label}>{group.label}⌄</button>
          {open === group.label && <div className="absolute left-0 top-full w-[650px] rounded-b-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-card"><div className="grid grid-cols-3 gap-2">{group.items.map((item) => <Link className="rounded-lg p-3 hover:bg-brand-mist" href={`/models/${item.slug}`} key={`${group.label}-${item.slug}`}><span className="block font-semibold">{item.name}</span><span className="text-xs text-slate-500">{item.category}</span></Link>)}</div></div>}
        </div>)}
      </nav>
      <div className="flex items-center gap-2"><Link className="hidden rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark sm:inline-flex" href="/#test-drive">Туршилтын жолоодлого</Link><button className="focus-ring rounded-lg border px-3 py-2 text-sm xl:hidden" onClick={() => setMobile((value) => !value)} aria-expanded={mobile}>Цэс</button></div>
    </div>
    {mobile && <nav className="max-h-[calc(100vh-64px)] overflow-auto border-t bg-white p-4 text-slate-900 xl:hidden">{navigation.map((group) => <details className="border-b py-2" key={group.label}><summary className="cursor-pointer font-semibold">{group.label}</summary><div className="grid gap-1 py-2">{group.items.map((item) => <Link onClick={() => setMobile(false)} className="rounded p-2 hover:bg-brand-mist" href={`/models/${item.slug}`} key={`${group.label}-${item.slug}`}>{item.name} — {item.category}</Link>)}</div></details>)}</nav>}
  </header>;
}
