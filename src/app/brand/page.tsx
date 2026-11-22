import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_FACTS, BRAND_PILLARS, BRAND_SOURCES, BRAND_TIMELINE } from "@/data/brand";
import { getNavigation } from "@/data/content";

// «Ruichi брэнд» (user test #1, 2026-11-23, item 11): visitors did not know the maker and did not trust it.
// Who Ruichi is, its history and record, and what the dealer adds. The video block is a placeholder until the
// user's video is ready ("үүнийг дараа нь хийнэ").
export const metadata: Metadata = {
  title: "Ruichi брэнд — Seres группийн цахилгаан арилжааны машин",
  description: "Ruichi нь 2003 оноос хойш цахилгаан арилжааны машин үйлдвэрлэж буй Хятадын Seres группийн үйлдвэр. Түүх, амжилт, баталгаа."
};

export const revalidate = 300;

export default async function BrandPage() {
  const navigation = await getNavigation();
  const count = new Set(navigation.flatMap((category) => category.items.map((item) => item.slug))).size;
  return (
    <main className="brand-page">
      <section className="brand-hero">
        <div className="brand-hero__inner">
          <p className="brand-kicker">Ruichi брэнд</p>
          <h1 className="brand-hero__title">2003 оноос хойш зөвхөн цахилгаан ажлын машин</h1>
          <p className="brand-hero__text">
            Ruichi (瑞驰) нь Хятадын Seres группийн цахилгаан арилжааны машины үйлдвэр. Түгээлт, ачаа тээвэр, үйлчилгээ,
            зорчигч тээвэрт зориулсан фургон, ачааны машинуудыг 20 гаруй жил үйлдвэрлэж байна.
          </p>
          <div className="brand-hero__actions">
            <Link className="btn btn--primary" href="/#models">{count} загвар үзэх</Link>
            <Link className="btn btn--secondary" href="/warranty/">Баталгааны нөхцөл</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ul className="brand-facts">
            {BRAND_FACTS.map((fact) => (
              <li key={fact.label}>
                <strong>{fact.value}</strong>
                <span className="brand-facts__label">{fact.label}</span>
                <p>{fact.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Video placeholder: the user will add the brand film later. */}
      <section className="section">
        <div className="container">
          <div className="brand-video" role="img" aria-label="Брэндийн видео удахгүй нэмэгдэнэ">
            <span className="brand-video__play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="34" height="34"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
            </span>
            <p className="brand-video__title">Ruichi үйлдвэрийн танилцуулга</p>
            <p className="brand-video__text">Видео удахгүй нэмэгдэнэ</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="brand-kicker">Түүх ба амжилт</p>
          <h2 className="h2 brand-h2">Ruichi-ийн зам</h2>
          <ol className="brand-timeline">
            {BRAND_TIMELINE.map((item) => (
              <li key={item.title}>
                <span className="brand-timeline__year">{item.year}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="brand-kicker">Яагаад Ruichi гэж</p>
          <h2 className="h2 brand-h2">Монголд итгэлтэй ажиллана</h2>
          <ul className="brand-pillars">
            {BRAND_PILLARS.map((pillar) => (
              <li key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </li>
            ))}
          </ul>
          <div className="brand-cta">
            <p>Аль загвар таны ажилд тохирохыг манай зөвлөхөөс асуугаарай, эсвэл туршаад үзээрэй.</p>
            <Link className="btn btn--primary" href="/#test-drive">Туршилтын жолоодлого</Link>
          </div>
          <p className="brand-sources">
            Эх сурвалж:{" "}
            {BRAND_SOURCES.map((source, i) => (
              <span key={source.href}>{i > 0 && " · "}<a href={source.href} target="_blank" rel="noopener">{source.label}</a></span>
            ))}
          </p>
        </div>
      </section>
    </main>
  );
}
