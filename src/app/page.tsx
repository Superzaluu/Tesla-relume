import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { ChargerStats, CtaBlock, GallerySlider, TestDriveSection } from "@/components/home/HomeSections";
import { ModelGrid } from "@/components/cards/ModelGrid";
import { PollCard } from "@/components/home/PollCard";
import { TestDriveForm } from "@/components/forms/TestDriveForm";
import { galleryImages, heroSlides, pollChoices, testDriveModels } from "@/data/home";
import { modelCardCategories, modelCards } from "@/data/modelCards";

export default function HomePage() {
  return (
    <>
      <main>
        <HeroCarousel slides={heroSlides} />

        <section className="section">
          <div className="container">
            <PollCard choices={pollChoices} />
          </div>
        </section>

        <ModelGrid cards={modelCards} categories={modelCardCategories} />

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
