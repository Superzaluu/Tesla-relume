import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const metadata: Metadata = { title: "Баталгаат хугацаа — Ruichi" };

const terms = [
  { title: "6 ЖИЛ", models: "EC75, EC75 Pro, R5, R5 Pro, C3, C5", limit: "300,000 км хүртэл" },
  { title: "6 ЖИЛ", models: "EC35II, EC31, EC31L, EC31S, C5 CNG, C5 Бензин, C5 Дрон", limit: "300,000 км хүртэл" },
  { title: "ҮЗЛЭГ", models: "Тогтмол оношилгоо, ашиглалтын зааврын дагуух үйлчилгээг эрх бүхий төвд хийлгэнэ.", limit: "Нөхцөлтэй" }
];

export default function WarrantyPage() {
  return (
    <main className="warranty-page">
      <section className="warranty-hero">
        <div>
          <p className="tagline">БАТАЛГААТ ХУГАЦАА</p>
          <h1 className="h1">ИТГЭЛТЭЙ ЯВНА</h1>
          <p className="text-medium">Үйлдвэрлэгчийн зайны багцын баталгаат хугацаанаас нэг жилээр бууруулсан, Монгол дахь үйлчилгээний нөхцөл.</p>
        </div>
        <img src="/assets/order-models.png" alt="Цахилгаан автомашины баталгаат хугацаа" />
      </section>
      <section className="section">
        <div className="container container--gap-80">
          <SectionTitle title="Зайны багцын баталгаа" text="Баталгааны хугацаа нь эхний худалдан авагчид хамаарах бөгөөд засвар, үзлэгийн нөхцөлийг мөрдөнө." />
          <div className="warranty-grid">
            {terms.map((term) => <article key={term.models}><h2>{term.title}</h2><p>{term.models}</p><strong>{term.limit}</strong></article>)}
          </div>
          <p className="warranty-note">
            Анхааруулга: Үйлдвэрлэгчийн EC75 Pro мэдээлэлд зайны багц 8 жил буюу 600,000 км гэж заасан. Энэхүү сайтад харуулсан 6 жил / 300,000 км нь таны хүссэн орон нутгийн баталгааны нөхцөл юм.{" "}
            <a href="https://www.rc-ev.com/cms/a/EC75PROKYB.html" target="_blank" rel="noopener">Үйлдвэрлэгчийн эх сурвалжийг харах</a>
          </p>
        </div>
      </section>
    </main>
  );
}
