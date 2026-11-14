import type { Metadata } from "next";
import { GreenLoanCalculator } from "@/components/forms/GreenLoanCalculator";
import { getNavigation } from "@/data/content";
import { DOCUMENTS, GREEN_LOAN_CHECKED_ON, GREEN_LOAN_SOURCE, RATE_TIERS, REQUIREMENTS } from "@/data/greenLoan";
import { preorderModelValue, type PreorderModel } from "@/data/preorder";

export const metadata: Metadata = {
  title: "Ногоон зээл — Ruichi",
  description: "ХААН Банкны ногоон тээврийн хэрэгслийн зээлээр цахилгаан автомашинаа аваарай. Сарын төлбөрөө тооцоолоод хүсэлтээ илгээнэ үү."
};

const HIGHLIGHTS = [
  { value: "10%", label: "Урьдчилгаа", note: "Үл хөдлөх хөрөнгө барьцаалбал 0% хүртэл" },
  { value: "96 сар", label: "Хугацаа", note: "Бизнесийн орлоготой бол" },
  { value: "0₮", label: "Өргөдлийн хураамж", note: "Шимтгэл 0.5%, 500,000₮ хүртэл" }
];

export default async function GreenLoanPage({ searchParams }: { searchParams: Promise<{ model?: string; variant?: string }> }) {
  const { model, variant } = await searchParams;
  const models: PreorderModel[] = (await getNavigation()).flatMap((category) =>
    category.items.map((item) => ({
      value: preorderModelValue(item.slug, item.variant), name: item.name, desc: item.desc, category: category.label, thumb: item.thumb
    }))
  );
  const initial =
    models.find((item) => item.value === preorderModelValue(model ?? "", variant))?.value ??
    models.find((item) => item.value.startsWith(`${model ?? ""}|`))?.value ??
    "";

  return (
    <main className="tw bg-[#f5f7f8] pb-section-md pt-[calc(var(--navbar-height)+48px)]">
      <div className="mx-auto max-w-[1180px] px-global">
        <p className="tagline">Ногоон зээл · ХААН Банк</p>
        <h1 className="mt-2 text-[clamp(32px,4vw,48px)] font-bold leading-tight tracking-tight text-ink">Цахилгаан машинаа ногоон зээлээр</h1>
        <p className="mt-3 max-w-[680px] text-medium text-ink-secondary">
          Ruichi нь ХААН Банкны ногоон зээлийн хамтран ажиллах нийлүүлэгч. Цахилгаан (BEV) болон залгууртай хосолсон (PHEV, EREV) машиндаа
          хөнгөлөлттэй хүүтэй зээл аваарай. Сарын төлбөрөө доор тооцоолоод хүсэлтээ илгээнэ үү.
        </p>

        <ul className="m-0 mb-10 mt-8 grid list-none gap-3 p-0 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <li key={item.label} className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="m-0 text-[28px] font-bold leading-none tracking-tight text-[#0f5a3a]">{item.value}</p>
              <p className="m-0 mt-2 text-small font-semibold text-ink">{item.label}</p>
              <p className="m-0 text-xs text-ink-muted">{item.note}</p>
            </li>
          ))}
        </ul>

        <GreenLoanCalculator models={models} initial={initial} />

        <section className="mt-14" aria-labelledby="rates-title">
          <h2 id="rates-title" className="text-[26px] font-bold tracking-tight text-ink">Зээлийн хүү</h2>
          <p className="mb-5 mt-1 text-small text-ink-muted">Шинэ тээврийн хэрэгслийн зээл. Хүү нь орлогын төрөл, хугацаанаас хамаарна.</p>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[520px] border-collapse text-left text-small">
              <thead>
                <tr className="bg-[#f3f7f5] text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-semibold">Орлого, хугацаа</th>
                  <th className="px-5 py-3 font-semibold">Сарын хүү</th>
                  <th className="px-5 py-3 font-semibold">Жилийн хүү</th>
                </tr>
              </thead>
              <tbody>
                {RATE_TIERS.map((tier) => (
                  <tr key={tier.label} className="border-t border-line">
                    <td className="px-5 py-3 text-ink">{tier.label}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{tier.monthly}%</td>
                    <td className="px-5 py-3 text-ink-secondary">{tier.annual}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-ink-muted">Зээлийн бодит өртөг (жилээр) 15.71%–16.96%. Энгийн хайбрид (hybrid) машинд хамаарахгүй.</p>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          {[
            { title: "Тавигдах шаардлага", items: REQUIREMENTS },
            { title: "Бүрдүүлэх материал", items: DOCUMENTS }
          ].map((block) => (
            <div key={block.title} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-[20px] font-bold tracking-tight text-ink">{block.title}</h2>
              <ul className="m-0 mt-4 grid list-none gap-3 p-0">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3 text-small text-ink-secondary">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eaf3ee] text-[11px] font-bold text-[#0f5a3a]" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <p className="mt-8 text-xs text-ink-muted">
          Нөхцөлийг ХААН Банкны{" "}
          <a href={GREEN_LOAN_SOURCE} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0f5a3a] underline underline-offset-2">ногоон тээврийн хэрэгслийн зээл</a>{" "}
          хуудаснаас {GREEN_LOAN_CHECKED_ON}-нд авсан. Банк нөхцөлөө өөрчилж болох тул эцсийн нөхцөлийг банкнаас тодруулна уу.
        </p>
      </div>
    </main>
  );
}
