import { HeroCarousel } from "@/components/HeroCarousel";
import { ChargerStats, CtaBlock, GallerySlider, ModelCardSlider, TestDriveSection } from "@/components/HomeSections";
import { PollCard } from "@/components/PollCard";
import { TestDriveForm } from "@/components/TestDriveForm";
import { galleryImages, heroSlides, pollChoices, testDriveModels } from "@/data/home";
import { navigation } from "@/data/navigation";

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

        <ModelCardSlider items={navigation.flatMap((category) => category.items)} />

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
