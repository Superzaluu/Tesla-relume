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
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(null); setMobile(false); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  const filled = solid || open || mobile;
  const active = navigation.find((group) => group.label === open);
  return <header onMouseLeave={() => setOpen(null)} className={`fixed inset-x-0 top-0 z-40 border-b transition ${filled ? "border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur" : "border-transparent bg-gradient-to-b from-slate-950/70 to-transparent text-white"}`}>
    <div className="page-shell flex min-h-16 max-w-[1600px] items-center justify-between gap-4">
      <Link className="shrink-0" href="/" aria-label="Нүүр хуудас" onMouseEnter={() => setOpen(null)}><Image src="/assets/brand-logo-transparent.png" alt="Ruichi" width={57} height={36} className={filled ? "" : "brightness-0 invert"} /></Link>
      <nav className="hidden min-[1400px]:flex min-[1400px]:items-center 2xl:gap-1" aria-label="Загварууд">
        {navigation.map((group) => <button key={group.label} type="button" onMouseEnter={() => setOpen(group.label)} onClick={() => setOpen((value) => value === group.label ? null : group.label)} aria-expanded={open === group.label} aria-controls="nav-panel" className={`focus-ring flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium transition 2xl:px-3 2xl:text-sm ${open === group.label ? "bg-slate-900/5" : "hover:bg-slate-900/5"}`}>
          {group.label}
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" className={`transition ${open === group.label ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>)}
      </nav>
      <div className="flex shrink-0 items-center gap-2" onMouseEnter={() => setOpen(null)}><Link className="hidden whitespace-nowrap rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark sm:inline-flex" href="/#test-drive">Туршилтын жолоодлого</Link><button className="focus-ring rounded-lg border px-3 py-2 text-sm min-[1400px]:hidden" onClick={() => setMobile((value) => !value)} aria-expanded={mobile}>Цэс</button></div>
    </div>

    {active && <div id="nav-panel" className="absolute inset-x-0 top-full hidden border-b border-slate-200 bg-white text-slate-900 shadow-card min-[1400px]:block">
      <div className="page-shell py-6">
        <p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-brand">{active.label}</p>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {active.items.map((item) => <li key={`${active.label}-${item.slug}`}><Link onClick={() => setOpen(null)} href={item.href} className="group block rounded-xl p-2 transition hover:bg-brand-mist">
            <span className="block aspect-[5/3] overflow-hidden rounded-lg bg-slate-100"><Image src={item.thumb} alt="" width={400} height={240} className="h-full w-full object-cover transition group-hover:scale-105" /></span>
            <span className="mt-2 block font-semibold">{item.name}</span>
            <span className="block text-xs text-slate-500">{item.desc}</span>
          </Link></li>)}
        </ul>
      </div>
    </div>}

    {mobile && <nav className="max-h-[calc(100vh-64px)] overflow-auto border-t bg-white p-4 text-slate-900 min-[1400px]:hidden" aria-label="Загварууд">{navigation.map((group) => <details className="border-b py-2" key={group.label}><summary className="cursor-pointer py-1 font-semibold">{group.label}</summary><ul className="grid gap-1 py-2">{group.items.map((item) => <li key={`${group.label}-${item.slug}`}><Link onClick={() => setMobile(false)} className="flex items-center gap-3 rounded-lg p-2 hover:bg-brand-mist" href={item.href}><Image src={item.thumb} alt="" width={80} height={48} className="h-12 w-20 shrink-0 rounded object-cover" /><span><span className="block font-medium">{item.name}</span><span className="block text-xs text-slate-500">{item.desc}</span></span></Link></li>)}</ul></details>)}</nav>}
  </header>;
}
