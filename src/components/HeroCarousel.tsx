"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Model } from "@/data/models";
import { QuickSpecs } from "./QuickSpecs";
import { ButtonLink } from "./Button";
import { SavingsCalculator } from "./SavingsCalculator";

export function HeroCarousel({ items }: { items: Model[] }) {
  const [index, setIndex] = useState(0); const current = items[index];
  useEffect(() => { const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; if (reduced) return; const id = window.setInterval(() => setIndex((value) => (value + 1) % items.length), 7000); return () => window.clearInterval(id); }, [items.length]);
  const go = (offset: number) => setIndex((value) => (value + offset + items.length) % items.length);
  return <section className="relative min-h-[700px] overflow-hidden bg-slate-950 text-white" aria-roledescription="carousel" aria-label="Ruichi загварууд" onKeyDown={(event) => event.key === "ArrowRight" ? go(1) : event.key === "ArrowLeft" ? go(-1) : undefined} tabIndex={0}>
    <Image priority src={current.hero} alt={current.name} fill className="object-cover opacity-75 transition-opacity duration-500" sizes="100vw" />
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" /><div className="page-shell relative z-10 flex min-h-[700px] flex-col justify-center py-28"><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-300">{current.category}</p><h1 className="mt-2 text-5xl font-bold tracking-tight md:text-7xl">{current.name}</h1><p className="mt-4 max-w-xl text-lg text-slate-100">{current.tagline}</p><div className="mt-7 flex flex-wrap gap-3"><SavingsCalculator /><ButtonLink href={`/models/${current.slug}`}>Дэлгэрэнгүй</ButtonLink><ButtonLink href="/#test-drive">Ногоон зээл</ButtonLink></div><div className="mt-8 max-w-4xl"><QuickSpecs specs={current.quick} /></div></div>
    <button className="absolute left-4 top-1/2 z-20 rounded-full bg-white/90 p-3 text-slate-900" onClick={() => go(-1)} aria-label="Өмнөх загвар">‹</button><button className="absolute right-4 top-1/2 z-20 rounded-full bg-white/90 p-3 text-slate-900" onClick={() => go(1)} aria-label="Дараагийн загвар">›</button><div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">{items.map((item, itemIndex) => <button key={item.slug} className={`h-2 rounded-full transition ${itemIndex === index ? "w-7 bg-white" : "w-2 bg-white/50"}`} onClick={() => setIndex(itemIndex)} aria-label={`${item.name} слайд`} />)}</div>
  </section>;
}
