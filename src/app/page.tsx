import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { ChargerStats, CtaBlock, GallerySlider, TestDriveSection } from "@/components/home/HomeSections";
import { ModelGrid } from "@/components/cards/ModelGrid";
import { PollCard } from "@/components/home/PollCard";
import { TestDriveForm } from "@/components/forms/TestDriveForm";
import { getHeroSlides, getModelCards } from "@/data/content";
import { galleryImages, pollChoices, testDriveModels } from "@/data/home";

// Refresh the Supabase content at most once a minute.
export const revalidate = 60;

export default async function HomePage() {
  const [heroSlides, { cards, categories }] = await Promise.all([getHeroSlides(), getModelCards()]);

  return (
    <>
      <main>
        <HeroCarousel slides={heroSlides} />

        <section className="section">
          <div className="container">
            <PollCard choices={pollChoices} />
          </div>
        </section>

        <ModelGrid cards={cards} categories={categories} />

        <CtaBlock
          title="Одоогийн урамшуулал"
          text="Урамшуулал, хуучин машинаа өгөх, банкны зээлийн мэдээлэлээ эндээс аваарай"
          action={{ label: "Дэлгэрэнгүй үзэх", href: "#" }}
          image={{ src: "/assets/promo.png", alt: "Урамшуулал", shape: "4x3" }}
        />
        <CtaBlock
          className="cta--warranty"
          title="Баталгаат хугацаа"
          text="Зайны багц болон автомашины баталгааны нөхцөлийг харна уу."
          action={{ label: "Баталгааг харах", href: "/warranty/" }}
          image={{ src: "/assets/order-models.png", alt: "Баталгаат хугацаа: 6 жил, 300,000 км", shape: "square" }}
        />

        <ChargerStats stats={[{ value: "50", label: "Хурдан цэнэглэгч" }, { value: "5", label: "Энгийн цэнэглэгч" }]} />
        <GallerySlider images={galleryImages} />
      </main>

      <TestDriveSection>
        <TestDriveForm models={testDriveModels} />
      </TestDriveSection>
    </>
  );
}
