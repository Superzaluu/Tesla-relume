import Link from "next/link";
import type { ReactNode } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Slider } from "@/components/ui/Slider";

/** Text + image call-to-action block (promotion, warranty). */
export function CtaBlock({ title, text, action, image, className = "" }: {
  title: string; text: string; action: { label: string; href: string };
  image: { src: string; alt: string; shape: "4x3" | "square" }; className?: string;
}) {
  return (
    <section className="section">
      <div className="container">
        <div className={`cta ${className}`.trim()}>
          <div className="cta__column">
            <div className="section-title__text">
              <h2 className="h2">{title}</h2>
              <p className="text-medium">{text}</p>
            </div>
            <div className={`actions${className ? " actions--gap-16" : ""}`}>
              <Link className="btn btn--primary" href={action.href}>{action.label}</Link>
            </div>
          </div>
          <img className={`cta__image cta__image--${image.shape}`} src={image.src} alt={image.alt} />
        </div>
      </div>
    </section>
  );
}

const Chevron = () => <img src="/assets/chevron-right.svg" width={24} height={24} alt="" />;

/** Charger counts + Google map. */
export function ChargerStats({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="section" id="chargers">
      <div className="container container--gap-80">
        <div className="stats">
          <div className="stats__intro">
            <div className="section-title__text">
              <h2 className="h2">Цэнэглэгчийн байршил</h2>
              <p className="text-medium">Таны ойролцоох цэнэглэх газрууд</p>
            </div>
            <div className="actions actions--gap-24">
              <a className="btn btn--secondary" href="#charger-map">Газрын зураг</a>
              <a className="btn btn--link" href="https://www.google.com/maps/search/EV+charging+station+Ulaanbaatar" target="_blank" rel="noopener">
                Дэлгэрэнгүй <Chevron />
              </a>
            </div>
          </div>
          <div className="stats__list">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <p className="stat__number">{stat.value}</p>
                <p className="h6">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="charger-map" id="charger-map">
          <iframe
            src="https://www.google.com/maps?q=EV+charging+station,+Ulaanbaatar&z=12&output=embed"
            title="Улаанбаатар дахь цэнэглэх станцуудын газрын зураг" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export function GallerySlider({ images }: { images: string[] }) {
  return (
    <section className="section">
      <div className="container container--gap-80">
        <SectionTitle title="Зургийн цомог" text="Манай автомашины зургийн цомгийг үзнэ үү." />
        <Slider className="slider--gallery" dots={{ src: "/assets/slider-dots-3.svg", width: 40 }}>
          {images.map((src, i) => <img className="gallery__item" src={src} alt={`Зураг ${i + 1}`} key={src} />)}
        </Slider>
      </div>
    </section>
  );
}

export function TestDriveSection({ children }: { children: ReactNode }) {
  return (
    <section className="section test-drive" id="test-drive" aria-labelledby="test-drive-title">
      <div className="container test-drive__inner">
        <SectionTitle id="test-drive-title" title="Туршилтын жолоодлого" text="Холбоо барих мэдээллээ үлдээгээрэй. Манай зөвлөх тантай холбогдоно." />
        {children}
      </div>
    </section>
  );
}
