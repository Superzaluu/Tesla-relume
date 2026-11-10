"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Model } from "@/data/models";
import { ButtonLink } from "./Button";
import { QuickSpecs } from "./QuickSpecs";
import { SavingsCalculator } from "./SavingsCalculator";
import { FeatureSection, Gallery, ModelStats, SpecsTable } from "./ModelSections";

export function ModelPage({ model }: { model: Model }) {
  const [variantIndex, setVariantIndex] = useState(0); const variant = model.variants?.[variantIndex]; const hero = variant?.hero ?? model.hero; const tagline = variant?.tagline ?? model.tagline; const stats = variant ? [...model.specs.slice(0, 3), ...variant.specs] : model.specs;
  return <main><section className="relative grid min-h-[680px] place-items-end overflow-hidden bg-slate-950 text-white"><Image src={hero} alt={model.name} fill priority className="object-cover opacity-75" sizes="100vw" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" /><div className="page-shell relative z-10 w-full py-24"><p className="font-bold uppercase tracking-[.16em] text-emerald-300">{model.category}</p><h1 className="mt-2 text-5xl font-bold md:text-7xl">{model.name}</h1><p className="mt-4 max-w-xl text-lg">{tagline}</p>{model.variants && <div className="mt-6 flex gap-2" role="group" aria-label="Хувилбар сонгох">{model.variants.map((item, index) => <button className={`rounded-lg border px-4 py-2 font-semibold ${index === variantIndex ? "border-brand bg-brand" : "border-white/60 bg-white/10"}`} key={item.name} onClick={() => setVariantIndex(index)}>{item.name}</button>)}</div>}<div className="mt-7 flex flex-wrap gap-3"><SavingsCalculator /><ButtonLink href="/#test-drive">Туршилтын жолоодлого</ButtonLink></div><div className="mt-8 max-w-4xl"><QuickSpecs specs={model.quick} /></div></div></section>
    <ModelStats specs={stats} />
    <FeatureSection><div><p className="font-semibold text-brand">Ruichi</p><h2 className="mt-2 text-3xl font-bold">Ажилд зориулагдсан шийдэл</h2><p className="mt-4 leading-7 text-slate-600">{model.tagline} Техникийн нарийвчилсан үзүүлэлт, сонголт болон бэлэн байдлын талаар манай багтай холбогдоно уу.</p></div><SpecsTable specs={model.quick} /></FeatureSection>
    {model.gallery?.length ? <Gallery name={model.name} images={model.gallery} /> : null}
    <section id="test-drive" className="section bg-brand"><div className="page-shell flex flex-wrap items-center justify-between gap-5 text-white"><div><h2 className="text-3xl font-bold">Туршилтын жолоодлого</h2><p className="mt-2 text-white/80">Өөрт тохирох Ruichi загвараа ойроос танилцаарай.</p></div><Link href="/register" className="rounded-xl bg-white px-6 py-3 font-semibold text-brand">Бүртгүүлэх</Link></div></section>
  </main>;
}
