import Link from "next/link";
import type { ReactNode } from "react";
import { SpecIcon } from "@/components/model/SpecIcon";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Slider } from "@/components/ui/Slider";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { DEPOSIT_REFUND_DAYS } from "@/data/preorder";

/** Text + image call-to-action block. No longer on the homepage (replaced by NumberBand); kept for other pages. */
export function CtaBlock({ title, text, action, image, figures, className = "" }: {
  title: string; text: string; action: { label: string; href: string };
  image: { src: string; alt: string; shape: "4x3" | "square" | "banner" }; figures?: { value: string; label: string }[]; className?: string;
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
            {figures && (
              <dl className="cta__figures">
                {figures.map((figure) => (
                  <div className="cta__figure" key={figure.label}><dt>{figure.label}</dt><dd>{figure.value}</dd></div>
                ))}
              </dl>
            )}
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

/**
 * Four promises on a white strip that overlaps the bottom edge of the hero (reference: EVdriveX feature strip).
 * Replaces the spec panel that used to sit on the hero photo.
 */
export function BenefitStrip() {
  const items = [
    { icon: "shield", title: "6 жил / 300,000 км", text: "Батерейн баталгаа", href: "/warranty/" },
    { icon: "charging", title: "18 минут", text: "20–80% хурдан цэнэглэлт", href: "#chargers" },
    { icon: "percent", title: "Ногоон зээл", text: "Урьдчилгаа 10%-аас", href: "/green-loan/" },
    { icon: "snow", title: "−30°C", text: "Хүйтэнд туршсан", href: "#gallery" }
  ];
  return (
    <div className="tw benefit-strip relative z-[15] px-global">
      <ul className="m-0 mx-auto grid max-w-[1376px] list-none grid-cols-2 overflow-hidden rounded-card border border-solid border-line bg-white p-0 shadow-[0_14px_36px_rgb(15_35_56/.12)] lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.title} className={`border-0 border-solid border-line ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`}>
            <Link href={item.href} className="flex h-full items-center gap-3 px-4 py-4 hover:bg-[#f6faf8] sm:px-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-solid border-[#bcd7c7] bg-white text-[#0f5a3a]"><SpecIcon icon={item.icon} /></span>
              <span className="min-w-0">
                <span className="block text-[15px] font-bold leading-tight text-ink">{item.title}</span>
                <span className="block text-small text-ink-muted">{item.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The model line-up photo with four key numbers under it and a thin promotion bar (reference: Electric Drive
 * Store stats band). Replaces the separate promotion and warranty blocks.
 */
export function NumberBand({ models, versions, fastChargers }: { models: number; versions: number; fastChargers: number }) {
  const figures = [
    { value: String(models), label: `загвар, ${versions} хувилбар`, href: "#models" },
    { value: "6 жил", label: "300,000 км батерейн баталгаа", href: "/warranty/" },
    { value: String(fastChargers), label: "хурдан цэнэглэгч, Улаанбаатар", href: "#chargers" },
    { value: "10%", label: "урьдчилгаатай ногоон зээл", href: "/green-loan/" }
  ];
  return (
    <section className="section" aria-label="Ruichi тоогоор">
      <div className="container">
        <div className="tw overflow-hidden rounded-card border border-solid border-line bg-white shadow-[0_10px_30px_rgb(15_35_56/.08)]">
          <img
            src="/assets/order-models.png" alt="Ruichi-ийн цахилгаан ачааны машин, фургонууд эгнээгээрээ" width={1920} height={400} loading="lazy"
            className="block aspect-[3/1] w-full object-cover object-center sm:aspect-[24/5]"
          />
          <ul className="m-0 grid list-none grid-cols-2 bg-[#0f5a3a] p-0 lg:grid-cols-4">
            {figures.map((figure, i) => (
              <li key={figure.label} className={`border-0 border-solid border-white/15 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`}>
                <Link href={figure.href} className="block h-full px-5 py-5 text-white hover:bg-white/[.06]">
                  <span className="block text-[30px] font-bold leading-none tracking-tight tabular-nums">{figure.value}</span>
                  <span className="mt-1.5 block text-small text-white/80">{figure.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#eaf3ee] px-5 py-4">
            <p className="m-0 text-regular text-[#123b2a]"><strong>Одоогийн урамшуулал</strong> · хуучин машинаа өгөх, банкны зээлийн нөхцөл</p>
            <Link className="btn btn--primary min-h-[40px] px-5" href="/green-loan/">Дэлгэрэнгүй</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The order path the site already supports, as four numbered steps (reference: EVdriveX "How we work"). */
export function OrderSteps() {
  const steps = [
    { title: "Загвар сонгох", text: "Шүүлтүүр эсвэл хэрэглээний мөрөөс танд тохирохыг олно.", href: "#models" },
    { title: "Урьдчилгаа төлөх", text: `Byl-ээр (QPay, карт). Цуцалбал ${DEPOSIT_REFUND_DAYS} хоногт буцаана.`, href: "/preorder/" },
    { title: "Ногоон зээл", text: "ХААН Банк, урьдчилгаа 10%-аас, 96 сар хүртэл.", href: "/green-loan/" },
    { title: "Хүлээн авах", text: "Салбар дээрээ, 6 жил / 300,000 км баталгаатай.", href: "/warranty/" }
  ];
  return (
    <section className="section" aria-labelledby="order-steps">
      <div className="container container--gap-80">
        <SectionTitle id="order-steps" title="Захиалах 4 алхам" text="Сонгохоос хүлээн авах хүртэл бүгдийг онлайнаар эхлүүлнэ." />
        <ol className="tw m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Link href={step.href} className="flex h-full flex-col gap-2 rounded-card border border-solid border-line bg-white p-5 transition-colors hover:border-[#0f5a3a]">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0f5a3a] text-[15px] font-bold text-white">{i + 1}</span>
                <span className="text-regular font-bold text-ink">{step.title}</span>
                <span className="text-small text-ink-secondary">{step.text}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const MAPS_SEARCH = "https://www.google.com/maps/search/EV+charging+station+Ulaanbaatar";

/** Charger counts and the map side by side in one row (was a stats card plus a 560 px map below it). */
export function ChargerStats({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="section" id="chargers">
      <div className="container">
        <div className="tw grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="flex flex-col gap-5 rounded-card border border-solid border-line bg-white p-6 lg:p-8">
            <div>
              <h2 className="h2 m-0">Цэнэглэгчийн байршил</h2>
              <p className="text-medium m-0 mt-2">Таны ойролцоох цэнэглэх газрууд</p>
            </div>
            <dl className="m-0 flex flex-wrap gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="text-small text-ink-muted">{stat.label}</dt>
                  <dd className="m-0 text-[44px] font-bold leading-none tracking-tight text-ink tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto">
              <a className="btn btn--tint min-h-[42px] px-5" href={MAPS_SEARCH} target="_blank" rel="noopener">Google Maps-д нээх</a>
            </div>
          </div>
          <div className="charger-map h-[320px] overflow-hidden rounded-card border border-solid border-line lg:h-auto lg:min-h-[340px]" id="charger-map">
            <iframe
              src="https://www.google.com/maps?q=EV+charging+station,+Ulaanbaatar&z=12&output=embed" className="block h-full w-full border-0"
              title="Улаанбаатар дахь цэнэглэх станцуудын газрын зураг" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Photos and the −30°C test video as one mosaic (reference: the collage board): the video takes the large
 * tile, three photos fill the rest. Replaces the poll + video card and the one-photo-at-a-time slider.
 */
export function GalleryMosaic({ images }: { images: string[] }) {
  const [first, second, third] = images;
  const tile = "relative block overflow-hidden rounded-card bg-surface";
  return (
    <section className="section" id="gallery">
      <div className="container container--gap-80">
        <SectionTitle title="Зураг ба видео" text="EC75-ыг −30°C хүйтэнд туршсан бичлэг, загваруудын зураг." />
        <div className="tw grid grid-cols-2 gap-3 md:grid-cols-[2fr_1fr_1fr] md:grid-rows-[220px_220px]">
          <VideoPoster className={`${tile} col-span-2 aspect-video md:col-span-1 md:row-span-2 md:aspect-auto`} src="/assets/ec75-cold-test.mp4" label="EC75 −30°C хүйтний туршилтын видео тоглуулах">
            <img className="absolute inset-0 h-full w-full object-cover" src="/assets/ec75-cold-poster.jpg" alt="" loading="lazy" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <img className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2" src="/assets/play-button.svg" width={64} height={64} alt="" />
            <span className="absolute bottom-4 left-4 right-4 text-left text-white">
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/80">EC75 · хүйтний туршилт</span>
              <span className="block text-[20px] font-bold leading-tight">−30°C-д цасан замд</span>
            </span>
          </VideoPoster>
          {first && <div className={`${tile} aspect-[4/3] md:aspect-auto`}><img className="h-full w-full object-cover" src={first} alt="Ruichi загварын зураг 1" loading="lazy" /></div>}
          {second && <div className={`${tile} aspect-[4/3] md:aspect-auto`}><img className="h-full w-full object-cover" src={second} alt="Ruichi загварын зураг 2" loading="lazy" /></div>}
          {third && <div className={`${tile} col-span-2 aspect-[16/7] md:aspect-auto`}><img className="h-full w-full object-cover" src={third} alt="Ruichi загварын зураг 3" loading="lazy" /></div>}
        </div>
      </div>
    </section>
  );
}

/** Kept for other pages; the homepage uses GalleryMosaic. */
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
