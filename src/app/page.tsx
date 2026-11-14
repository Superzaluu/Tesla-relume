import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { BenefitStrip, ChargerStats, GalleryMosaic, NumberBand, OrderSteps, TestDriveSection } from "@/components/home/HomeSections";
import { ModelGrid } from "@/components/cards/ModelGrid";
import { buildRows } from "@/components/cards/modelFilters";
import { TestDriveForm } from "@/components/forms/TestDriveForm";
import { getHeroSlides, getModelCards } from "@/data/content";
import { galleryImages, testDriveModels } from "@/data/home";

// Refresh the Supabase content at most once a minute.
export const revalidate = 60;

const CHARGERS = [{ value: "50", label: "Хурдан цэнэглэгч" }, { value: "5", label: "Энгийн цэнэглэгч" }];

// Order (2026-11-15 layout pass): hero with the benefit strip on its edge, the model families in three
// rows, one number band (promotion + warranty), the order steps, chargers next to the map, photos and
// the −30°C video as one mosaic, then the test-drive form. About a third of the old page height.
export default async function HomePage() {
  const [heroSlides, { cards, categories }] = await Promise.all([getHeroSlides(), getModelCards()]);
  const families = buildRows(cards).reduce((sum, row) => sum + row.families.length, 0);

  return (
    <>
      <main>
        <HeroCarousel slides={heroSlides} />
        <BenefitStrip />
        <ModelGrid cards={cards} categories={categories} />
        <NumberBand models={families} versions={cards.length} fastChargers={Number(CHARGERS[0].value)} />
        <OrderSteps />
        <ChargerStats stats={CHARGERS} />
        <GalleryMosaic images={galleryImages} />
      </main>

      <TestDriveSection>
        <TestDriveForm models={testDriveModels} />
      </TestDriveSection>
    </>
  );
}
