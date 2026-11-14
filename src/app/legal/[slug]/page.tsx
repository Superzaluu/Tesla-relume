import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// TODO: Түр хувилбар. Хуулийн зөвлөхөөр хянуулж, компанийн бүтэн нэр, хаяг, холбоо барих мэдээллийг оруулах.
const UPDATED_ON = "2026-11-14";

type Section = { title: string; body: string[] };
type LegalPage = { title: string; intro: string; sections: Section[] };

const PAGES: Record<string, LegalPage> = {
  privacy: {
    title: "Нууцлалын бодлого",
    intro: "Ruichi-ийн цахим хуудсаар дамжуулан таны үлдээсэн хувийн мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалдаг талаар энд тайлбарлав.",
    sections: [
      {
        title: "1. Бид ямар мэдээлэл цуглуулдаг вэ",
        body: [
          "Урьдчилсан захиалга, ногоон зээлийн хүсэлт, туршилтын жолоодлого болон бонусын бүртгэлийн маягтаар таны өөрөө оруулсан мэдээлэл: овог, нэр, утасны дугаар, и-мэйл хаяг, Facebook нэр, сонирхсон загвар, төлбөрийн хэлбэр, тайлбар.",
          "Ногоон зээлийн тооцоолуурт оруулсан орлогын төрөл, машины үнэ, урьдчилгаа, хугацаа, сарын төлбөрийн тооцоо.",
          "Онлайн урьдчилгааг Byl (byl.mn) төлбөрийн үйлчилгээгээр авдаг. Төлбөрийн хуудсанд оруулсан карт, банкны мэдээллийг Byl болон банк боловсруулах бөгөөд бид хадгалдаггүй; бидэнд зөвхөн төлбөрийн дүн, төлөв, и-мэйл хаяг ирнэ.",
          "Бид таны банкны данс, картын мэдээлэл, иргэний үнэмлэхийн дугаарыг энэ цахим хуудсаар цуглуулдаггүй."
        ]
      },
      {
        title: "2. Мэдээллийг юунд ашигладаг вэ",
        body: [
          "Таны хүсэлтийн дагуу тантай холбогдох, захиалга болон зээлийн хүсэлтийг боловсруулах.",
          "Ногоон зээлийн хүсэлтийн хувьд таны зөвшөөрлөөр мэдээллийг хамтрагч банкинд (ХААН Банк) дамжуулах.",
          "Онлайн урьдчилгаа төлөх үед төлбөрийн баримт илгээх зорилгоор таны и-мэйл хаяг болон захиалгын дүнг Byl-д дамжуулах.",
          "Үйлчилгээгээ сайжруулах дотоод тайлан гаргах. Таны мэдээллийг зар сурталчилгааны зорилгоор гуравдагч этгээдэд худалдахгүй."
        ]
      },
      {
        title: "3. Хадгалалт ба хамгаалалт",
        body: [
          "Мэдээлэл нь хамгаалалттай өгөгдлийн санд хадгалагдах бөгөөд зөвхөн эрх бүхий ажилтан нэвтэрч харна.",
          "Хүсэлт хаагдсанаас хойш шаардлагагүй болсон мэдээллийг тогтоосон хугацааны дараа устгана."
        ]
      },
      {
        title: "4. Таны эрх",
        body: [
          "Та өөрийн мэдээллийг харах, засуулах, устгуулах хүсэлтийг манай салбарт эсвэл холбоо барих хаягаар гаргах эрхтэй.",
          "Монгол Улсын Хүний хувийн мэдээлэл хамгаалах тухай хуулийн дагуу таны эрхийг хангана."
        ]
      }
    ]
  },
  terms: {
    title: "Үйлчилгээний нөхцөл",
    intro: "Энэхүү цахим хуудсыг ашигласнаар та доорх нөхцөлийг хүлээн зөвшөөрч байна.",
    sections: [
      {
        title: "1. Мэдээллийн зориулалт",
        body: [
          "Загварын үзүүлэлт, зураг, үнэ нь мэдээллийн зориулалттай бөгөөд тохиргоо, нийлүүлэлтээс хамаарч өөрчлөгдөж болно. Эцсийн нөхцөлийг худалдааны гэрээгээр тогтооно.",
          "Ялгаатай мэдээлэл илэрвэл салбараас лавлана уу."
        ]
      },
      {
        title: "2. Тооцоолуурууд",
        body: [
          "Хэмнэлтийн болон ногоон зээлийн тооцоолуурын үр дүн нь ойролцоо тооцоо юм. Түлшний үнэ, цахилгааны тариф, банкны хүү өөрчлөгдөх тул бодит дүн зөрж болно.",
          "Зээлийн эцсийн шийдвэрийг банк гаргана."
        ]
      },
      {
        title: "3. Урьдчилсан захиалга",
        body: [
          "Урьдчилсан захиалгын маягт илгээх нь худалдан авах үүрэг үүсгэхгүй. Манай ажилтан тантай холбогдож нөхцөлийг тохиролцоно.",
          "Зарим загварын урьдчилсан захиалгыг баталгаажуулахын тулд урьдчилгаа (жишээ нь EC75-д 1,000,000 ₮) авдаг. Урьдчилгааг Byl төлбөрийн хуудсаар (QPay, карт, банкны шилжүүлэг) төлөх бөгөөд машины үнийн дүнгээс хасагдана.",
          "Захиалгаа цуцлах тохиолдолд манай салбар эсвэл холбоо барих хаягаар мэдэгдэхэд урьдчилгааг 2 хоногийн дотор таны төлсөн данс руу буцаан олгоно.",
          "Банкны шилжүүлгээр төлсөн урьдчилгаа дансны хуулгаар баталгаажсаны дараа захиалга баталгаажсанд тооцогдоно."
        ]
      },
      {
        title: "4. Оюуны өмч",
        body: [
          "Цахим хуудсын агуулга, зураг, лого нь Ruichi болон түүний түншүүдийн өмч бөгөөд зөвшөөрөлгүйгээр хуулбарлахыг хориглоно."
        ]
      }
    ]
  },
  cookies: {
    title: "Күүки тохиргоо",
    intro: "Энэ цахим хуудас таныг хянах зар сурталчилгааны күүки ашигладаггүй.",
    sections: [
      {
        title: "1. Зайлшгүй шаардлагатай",
        body: [
          "Админ хэсэгт нэвтрэх үед нэвтрэлтийн күүки ашиглана. Энгийн зочинд энэ күүки үүсэхгүй."
        ]
      },
      {
        title: "2. Хөтчийн санах ой",
        body: [
          "Санал асуулгын сонголт, хэмнэлтийн тооцоолуурт оруулсан утга зэргийг дараагийн удаа тохиромжтой байлгах үүднээс зөвхөн таны хөтөч дээр хадгална. Энэ мэдээлэл манай серверт илгээгдэхгүй.",
          "Та хөтчийнхөө тохиргооноос сайтын өгөгдлийг хүссэн үедээ устгаж болно."
        ]
      },
      {
        title: "3. Гуравдагч талын агуулга",
        body: [
          "Газрын зураг зэрэг гадны үйлчилгээ өөрийн күүкиг ашиглаж болно. Тэдгээрт тухайн үйлчилгээ үзүүлэгчийн нууцлалын бодлого үйлчилнэ."
        ]
      }
    ]
  }
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = PAGES[(await params).slug];
  return { title: page ? `${page.title} — Ruichi` : "Ruichi" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <main className="tw bg-[#f5f7f8] pb-section-md pt-[calc(var(--navbar-height)+48px)]">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-global md:grid-cols-[220px_1fr]">
        <nav aria-label="Хууль эрх зүй" className="md:sticky md:top-[calc(var(--navbar-height)+24px)] md:self-start">
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0 md:flex-col">
            {Object.entries(PAGES).map(([key, item]) => (
              <li key={key}>
                <Link
                  href={`/legal/${key}/`}
                  aria-current={key === slug ? "page" : undefined}
                  className={`block rounded-xl px-4 py-2.5 text-small font-semibold no-underline ${key === slug ? "bg-[#eaf3ee] text-[#0f5a3a]" : "text-ink-secondary hover:bg-white"}`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="rounded-2xl border border-solid border-[#dce3ea] bg-white px-6 py-8 md:px-10 md:py-10">
          <p className="tagline">Хууль эрх зүй</p>
          <h1 className="mt-2 text-[clamp(30px,3.6vw,44px)] font-bold leading-tight tracking-tight text-ink">{page.title}</h1>
          <p className="m-0 mt-2 text-xs text-ink-muted">Шинэчилсэн: {UPDATED_ON} · Түр хувилбар</p>
          <p className="mt-5 max-w-[680px] text-medium text-ink-secondary">{page.intro}</p>

          {page.sections.map((section) => (
            <section key={section.title} className="mt-8 border-0 border-t border-solid border-[#e6ecef] pt-6">
              <h2 className="m-0 text-[20px] font-bold tracking-tight text-ink">{section.title}</h2>
              <ul className="m-0 mt-3 grid gap-2 pl-5 text-ink-secondary">
                {section.body.map((line) => <li key={line} className="leading-relaxed">{line}</li>)}
              </ul>
            </section>
          ))}

          <p className="m-0 mt-10 rounded-xl bg-[#f3f7f5] px-5 py-4 text-small text-ink-secondary">
            Асуух зүйл байвал <Link href="/#test-drive" className="font-semibold text-[#0f5a3a]">хүсэлт илгээх</Link> хэсгээр бидэнтэй холбогдоно уу.
          </p>
        </article>
      </div>
    </main>
  );
}
