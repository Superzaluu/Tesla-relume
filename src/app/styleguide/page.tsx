import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdasTabs } from "@/components/AdasTabs";
import { ModelCard } from "@/components/HomeSections";
import { QuickSpecs } from "@/components/QuickSpecs";
import { SavingsTrigger } from "@/components/SavingsCalculator";
import { SectionTitle } from "@/components/SectionTitle";
import { Slider } from "@/components/Slider";
import { StyleguideNav, TokenValue, TypeSample } from "@/components/StyleguideLive";
import { TestDriveForm } from "@/components/TestDriveForm";
import { VariantProvider, VariantToggle } from "@/components/Variant";
import { ec75 } from "@/data/ec75";
import { navigation } from "@/data/navigation";
import { readSpecTable } from "@/data/specTable";
import {
  brandColors, colorGroups, motion, pageSections, principles, quickIcons, radii, sections, shadows, spacingTokens, typeTokens, uiIcons
} from "@/data/styleguide";
import type { Block } from "@/data/types";

export const metadata: Metadata = { title: "Styleguide — Ruichi", robots: { index: false } };

function Section({ id, num, title, lead, children }: { id: string; num: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[calc(var(--navbar-height)+24px)] border-t border-line py-14 first:border-t-0 first:pt-0">
      <p className="font-mono text-xs text-[#147a48]">{num}</p>
      <h2 className="mt-1 text-[32px] font-bold leading-tight tracking-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-medium text-ink-secondary">{lead}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

const Label = ({ children }: { children: ReactNode }) => <h3 className="mb-4 mt-10 text-small font-semibold uppercase tracking-wider text-ink-muted first:mt-0">{children}</h3>;
const Code = ({ children }: { children: ReactNode }) => <code className="font-mono text-xs text-[#0f5a3a]">{children}</code>;
const Demo = ({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) => (
  <div className={`rounded-2xl border border-line p-6 ${dark ? "bg-[#14213d]" : "bg-white"} ${className}`}>{children}</div>
);

const pick = <T extends Block["type"]>(type: T) =>
  ec75.page.sections?.flatMap((s) => s.blocks).find((b): b is Extract<Block, { type: T }> => b.type === type);

export default function StyleguidePage() {
  const cards = pick("cards");
  const adas = pick("adas");
  const specRows = (readSpecTable("c3") ?? []).slice(0, 9);
  const items = navigation.flatMap((c) => c.items);
  const sampleCards = [items[0], items.find((i) => i.slug === "c5")!];

  return (
    <main className="tw bg-[#f5f7fa] pt-[var(--navbar-height)]">
      <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-12 lg:px-12">
        <header className="mb-12">
          <p className="font-mono text-xs text-[#147a48]">Ruichi Mongolia</p>
          <h1 className="mt-2 text-[44px] font-bold leading-none tracking-tight text-ink md:text-[64px]">Styleguide</h1>
          <p className="mt-4 max-w-2xl text-medium text-ink-secondary">
            Сайтын өнгө, үсэг, зай, товч болон component-уудын нэгдсэн лавлах. Токены утгыг браузер дээрх бодит CSS-ээс шууд уншина.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="min-w-0"><StyleguideNav items={sections} /></aside>

          <div className="min-w-0">
            <Section id="principles" num="01" title="Зарчим" lead="Бүх шийдвэрийн суурь болох дөрвөн дүрэм.">
              <div className="grid gap-4 sm:grid-cols-2">
                {principles.map((p, i) => (
                  <Demo key={p.title}>
                    <p className="font-mono text-xs text-ink-muted">0{i + 1}</p>
                    <h3 className="mt-2 text-[20px] font-semibold text-ink">{p.title}</h3>
                    <p className="mt-2 text-regular text-ink-secondary">{p.text}</p>
                  </Demo>
                ))}
              </div>
            </Section>

            <Section id="brand" num="02" title="Брэнд" lead="Лого цайвар, бараан, ногоон дэвсгэр дээр. Header болон footer-т 57 × 36 px.">
              <div className="grid gap-4 sm:grid-cols-3">
                {[{ bg: "bg-white", label: "Цайвар", invert: false }, { bg: "bg-[#14213d]", label: "Бараан", invert: true }, { bg: "bg-[#0f5a3a]", label: "Ногоон", invert: true }].map((b) => (
                  <div key={b.label} className={`grid h-40 place-items-center rounded-2xl border border-line ${b.bg}`}>
                    <img src="/assets/brand-logo-transparent.png" width={114} height={72} alt={`Ruichi лого — ${b.label}`} className={b.invert ? "brightness-0 invert" : ""} />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-small text-ink-muted">Файл: <Code>/assets/brand-logo-transparent.png</Code> · Бараан дэвсгэр дээр <Code>filter: brightness(0) invert(1)</Code></p>
            </Section>

            <Section id="color" num="03" title="Өнгө" lead="CSS хувьсагчид болон брэндийн тогтмол өнгө. Tailwind-д ч мөн адил нэрээр (bg-primary, text-ink…) ашиглагдана.">
              {colorGroups.map((group) => (
                <div key={group.title}>
                  <Label>{group.title}</Label>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {group.tokens.map((t) => (
                      <div key={t.name} className="flex items-center gap-4 rounded-xl border border-line bg-white p-3">
                        <span className="h-14 w-14 shrink-0 rounded-lg border border-line" style={{ background: `var(${t.name})` }} />
                        <div className="min-w-0">
                          <Code>{t.name}</Code>
                          <div><TokenValue name={t.name} /></div>
                          <p className="text-xs text-ink-secondary">{t.use}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Label>Брэндийн өнгө</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {brandColors.map((c) => (
                  <div key={c.hex} className="overflow-hidden rounded-xl border border-line bg-white">
                    <div className="h-20" style={{ background: c.hex }} />
                    <div className="p-3">
                      <p className="text-small font-semibold text-ink">{c.name}</p>
                      <Code>{c.hex}</Code>
                      <p className="mt-1 text-xs text-ink-secondary">{c.use}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="type" num="04" title="Үсэг" lead="Inter (next/font, кирилл + латин). Хэмжээ, зузааныг бодит CSS-ээс уншиж харуулна.">
              <Label>Фонт</Label>
              <Demo>
                <p className="text-[48px] font-bold leading-none text-ink">Аа Бб Өө Үү 123</p>
                <p className="mt-3 text-small text-ink-secondary"><Code>--font-body</Code> · Inter · 400 бичвэр, 500 tagline, 600 товч, 700 гарчиг</p>
              </Demo>
              <Label>Текстийн загварууд</Label>
              <Demo>
                <TypeSample as="p" className="h1">Ирээдүйн логистик</TypeSample>
                <TypeSample as="p" className="h2">Ажил бүрт тохирох машин</TypeSample>
                <TypeSample as="p" className="h5">Тохиргооны харьцуулалт</TypeSample>
                <TypeSample as="p" className="h6">Хурдан цэнэглэгч</TypeSample>
                <TypeSample className="text-medium">Таны хэрэгцээнд тохирох цахилгаан автомашинаа сонгоорой.</TypeSample>
                <TypeSample className="text-regular">Ойролцоох салбартаа туршилтын жолоодлого захиалаарай.</TypeSample>
                <TypeSample className="tagline">Цахилгаан фургон</TypeSample>
                <TypeSample className="hero__eyebrow">Шинэ үеийн ачааны машин</TypeSample>
                <TypeSample className="stat__number">50</TypeSample>
              </Demo>
              <Label>Хэмжээний токен</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {typeTokens.map((t) => (
                  <div key={t} className="flex items-baseline justify-between rounded-lg border border-line bg-white px-4 py-3"><Code>{t}</Code><TokenValue name={t} /></div>
                ))}
              </div>
            </Section>

            <Section id="spacing" num="05" title="Зай" lead="Хуудасны зай нь токеноор удирдагдана; 991px-ээс нарийн дэлгэцэд багасна.">
              <div className="grid gap-3">
                {spacingTokens.map((t) => (
                  <div key={t.name} className="grid items-center gap-3 rounded-xl border border-line bg-white p-4 sm:grid-cols-[240px_1fr]">
                    <div><Code>{t.name}</Code> <TokenValue name={t.name} /><p className="text-xs text-ink-secondary">{t.use}</p></div>
                    <div className="h-3 rounded bg-[#0f5a3a]/80" style={{ width: `var(${t.name})` }} />
                  </div>
                ))}
              </div>
            </Section>

            <Section id="shape" num="06" title="Хэлбэр" lead="Булангийн радиус.">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {radii.map((r) => (
                  <div key={r.label} className="text-center">
                    <div className="mx-auto h-24 w-24 border-2 border-[#0f5a3a] bg-[#eef5f3]" style={{ borderRadius: r.value }} />
                    <p className="mt-3"><Code>{r.label}</Code></p>
                    <p className="text-xs text-ink-secondary">{r.use}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="stroke" num="07" title="Шугам" lead="Хүрээ, тусгаарлагч болон focus.">
              <div className="grid gap-4 sm:grid-cols-3">
                <Demo><div className="h-px bg-[var(--color-border)]" /><p className="mt-4 text-small text-ink-secondary">1px · <Code>--color-border</Code> — хүснэгт, footer</p></Demo>
                <Demo><div className="h-10 rounded-[12px] border border-[#0f5a3a]" /><p className="mt-4 text-small text-ink-secondary">1px ногоон — товч, сонголт</p></Demo>
                <Demo><button type="button" className="btn btn--secondary outline outline-2 outline-offset-2 outline-[var(--color-primary)]">Focus</button><p className="mt-4 text-small text-ink-secondary">2px primary, offset 2px — <Code>:focus-visible</Code></p></Demo>
              </div>
            </Section>

            <Section id="shadow" num="08" title="Сүүдэр" lead="Зөөлөн, доош чиглэсэн сүүдэр. Ногоон сүүдэр зөвхөн товчинд.">
              <div className="grid gap-6 sm:grid-cols-3 xl:grid-cols-5">
                {shadows.map((s) => (
                  <div key={s.name}>
                    <div className="h-24 rounded-xl bg-white" style={{ boxShadow: s.value }} />
                    <p className="mt-4 text-small font-semibold text-ink">{s.name}</p>
                    <p className="text-xs text-ink-secondary">{s.use}</p>
                    <p className="mt-1 break-all font-mono text-[11px] text-ink-muted">{s.value}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="icons" num="09" title="Дүрс" lead="Загварын шуурхай үзүүлэлтийн PNG icon болон интерфейсийн SVG.">
              <Label>Шуурхай үзүүлэлт — /assets/icons/</Label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-8">
                {quickIcons.map((file) => (
                  <div key={file} className="rounded-xl border border-line bg-white p-3 text-center">
                    <img src={`/assets/icons/${encodeURI(file)}`} alt="" className="mx-auto h-10 w-10 object-contain" />
                    <p className="mt-2 truncate text-[10px] text-ink-muted" title={file}>{file}</p>
                  </div>
                ))}
              </div>
              <Label>Интерфейс — /assets/</Label>
              <div className="flex flex-wrap gap-3">
                {uiIcons.map((file) => (
                  <div key={file} className="rounded-xl border border-line bg-white p-3 text-center">
                    <img src={`/assets/${file}`} alt="" className="mx-auto h-8 w-8 object-contain" />
                    <p className="mt-2 text-[10px] text-ink-muted">{file}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="components" num="10" title="Компонент" lead="components/ хавтсан дахь бодит component-ууд. Энд харагдаж буй нь сайт дээрхтэй яг ижил код.">
              <Label>Товч — .btn</Label>
              <Demo>
                <div className="sg-demo flex flex-wrap items-center gap-3">
                  <a className="btn btn--primary" href="#components">Урьдчилсан захиалга</a>
                  <a className="btn btn--secondary" href="#components">Үзүүлэлт харах</a>
                  <a className="btn btn--light" href="#components">Дэлгэрэнгүй</a>
                  <a className="btn btn--primary btn--wide" href="#components">btn--wide</a>
                  <SavingsTrigger />
                </div>
                <div className="mt-5 grid gap-1 text-xs text-ink-secondary sm:grid-cols-2">
                  <p><Code>.btn--primary</Code> гол үйлдэл</p>
                  <p><Code>.btn--secondary</Code> хоёрдогч үйлдэл</p>
                  <p><Code>.btn--light</Code> зураг, карт дээрх &quot;Дэлгэрэнгүй&quot;</p>
                  <p><Code>.btn--wide</Code> min-width 240px · <Code>SavingsTrigger</Code> тооцоолуур нээнэ</p>
                </div>
              </Demo>

              <Label>Хувилбар сонгогч — VariantToggle</Label>
              <Demo><VariantProvider><VariantToggle /></VariantProvider></Demo>

              <Label>Гарчиг — SectionTitle</Label>
              <Demo><SectionTitle tagline="Цэнэглэлт" title="Хурдан, хаана ч цэнэглэнэ" text="Tagline, h2 гарчиг, тайлбар бичвэр." /></Demo>

              <Label>Гол үзүүлэлт — .mstat</Label>
              <Demo>
                <dl className="mstats__list">
                  {ec75.page.stats.slice(0, 3).map((s, i) => (
                    <div className="mstat" key={i}><dt className="mstat__label">{s.label as string}</dt><dd className="mstat__value">{s.value as string}<span>{s.unit as string}</span></dd></div>
                  ))}
                </dl>
              </Demo>

              <Label>Шуурхай үзүүлэлт — QuickSpecs</Label>
              <Demo className="bg-[linear-gradient(135deg,#dfe9f2,#f5f7fa)]">
                <div className="sg-demo">{ec75.quick && <QuickSpecs specs={ec75.quick} />}</div>
              </Demo>

              <Label>Загварын карт — ModelCard</Label>
              <div className="grid gap-4 sm:grid-cols-2 [&_.vcard]:w-full [&_.vcard]:min-w-0">
                {sampleCards.map((item) => <ModelCard item={item} key={item.key} />)}
              </div>

              {cards && <>
                <Label>Карт слайдер — Slider + .mcard</Label>
                <div className="overflow-hidden">
                <Slider>
                  {cards.items.map((c) => (
                    <figure className="mcard" key={c.title}>
                      <img src={c.image.src as string} width={c.image.width} height={c.image.height} alt={c.image.alt as string} loading="lazy" />
                      <figcaption><h3>{c.title}</h3><p>{c.text}</p></figcaption>
                    </figure>
                  ))}
                </Slider>
                </div>
              </>}

              {adas && <>
                <Label>Tab — AdasTabs</Label>
                <AdasTabs items={adas.items.slice(0, 4)} />
              </>}

              <Label>Техникийн хүснэгт — .mspec-table</Label>
              <div className="mcompare__scroll">
                <table className="mspec-table">
                  <tbody>
                    {specRows.map((row, i) => row.kind === "group" ? (
                      <tr className="is-group" key={i}><th colSpan={row.span} scope="colgroup">{row.label}</th></tr>
                    ) : (
                      <tr className={row.head ? "is-head" : undefined} key={i}>
                        <th scope="row">{row.label}</th>
                        {row.cells.map((c, j) => <td key={j} colSpan={c.span}>{c.text}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Label>Маягт — TestDriveForm</Label>
              <Demo><TestDriveForm models={["EC75", "R5", "C5"]} /></Demo>
            </Section>

            <Section id="page-sections" num="11" title="Хэсгүүд" lead="Хуудсуудыг бүрдүүлэх том хэсгүүд. Нэр дээр дарж сайт дээр нь харна.">
              <div className="grid gap-6 xl:grid-cols-3">
                {pageSections.map((group) => (
                  <Demo key={group.page}>
                    <h3 className="text-[18px] font-semibold text-ink">{group.page}</h3>
                    <ol className="mt-4 grid list-none gap-3 p-0">
                      {group.items.map(([name, desc, href], i) => (
                        <li key={name} className="flex gap-3">
                          <span className="font-mono text-xs leading-5 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                          <span><Link href={href} className="font-semibold text-[#0f5a3a] hover:underline">{name}</Link><br /><span className="text-small text-ink-secondary">{desc}</span></span>
                        </li>
                      ))}
                    </ol>
                  </Demo>
                ))}
              </div>
            </Section>

            <Section id="motion" num="12" title="Хөдөлгөөн" lead="Сайт дээр ашиглагдаж буй хөдөлгөөн, түүний хугацаа.">
              <div className="overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full border-collapse text-left text-small">
                  <thead className="bg-[#eef5f3] text-ink">
                    <tr><th className="p-4 font-semibold">Хөдөлгөөн</th><th className="p-4 font-semibold">Төрөл</th><th className="p-4 font-semibold">Үзүүлэлт</th><th className="p-4 font-semibold">Хаана</th></tr>
                  </thead>
                  <tbody>
                    {motion.map((m) => (
                      <tr key={m.name} className="border-t border-line align-top">
                        <td className="p-4 font-semibold text-ink">{m.name}</td>
                        <td className="p-4"><span className={`rounded-full px-2 py-0.5 text-xs ${m.kind === "Macro" ? "bg-[#0f5a3a] text-white" : "bg-[#eef5f3] text-[#0f5a3a]"}`}>{m.kind}</span></td>
                        <td className="p-4 text-ink-secondary">{m.spec}</td>
                        <td className="p-4"><Code>{m.where}</Code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
