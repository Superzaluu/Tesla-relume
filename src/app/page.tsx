import { HeroCarousel } from "@/components/hero/HeroCarousel";
import { ChargerStats, GalleryMosaic, NumberBand, OrderSteps, TestDriveSection } from "@/components/home/HomeSections";
import { ModelGrid } from "@/components/cards/ModelGrid";
import { buildRows } from "@/components/cards/modelFilters";
import { TestDriveForm } from "@/components/forms/TestDriveForm";
import { SavingsTeaser } from "@/components/home/SavingsTeaser";
import { getCalculatorModels, getHeroSlides, getModelCards } from "@/data/content";
import { galleryImages, testDriveModels } from "@/data/home";
import { getFuelPrices } from "@/lib/fuelPrices";

// Refresh the Supabase content at most once a minute.
export const revalidate = 60;

// Order (2026-11-15 layout pass): hero with the benefit strip on its edge, the model families in three
// rows, one number band (promotion + warranty), the order steps, chargers next to the map, photos and
// the −30°C video as one mosaic, then the test-drive form. About a third of the old page height.
export default async function HomePage() {
  const [heroSlides, { cards, categories }, calculatorModels, fuelPrices] = await Promise.all([
    getHeroSlides(), getModelCards(), getCalculatorModels(), getFuelPrices()
  ]);
  const families = buildRows(cards).reduce((sum, row) => sum + row.families.length, 0);

  return (
    <>
      <main>
        {/* The carousel also renders the benefit strip, whose first item is the current slide's range. */}
        <HeroCarousel slides={heroSlides} />
        {/* Cost calculator right under the hero (user, 2026-11-15); the hero subtitles already name each model's work. */}
        <SavingsTeaser models={calculatorModels} fuelPrices={fuelPrices} />
        <ModelGrid cards={cards} categories={categories} />
        <NumberBand models={families} versions={cards.length} />
        <OrderSteps />
        {/* Real stations from evmashin.com (src/data/chargers.ts); refresh with scripts/chargers/import-evmashin.mjs. */}
        <ChargerStats />
        <GalleryMosaic images={galleryImages} />
      </main>

      <TestDriveSection>
        <TestDriveForm models={testDriveModels} />
      </TestDriveSection>
    </>
  );
}
