# Ruichi Монгол — Next.js сайт

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.

## Ажиллуулах

```powershell
npm install      # анх удаа
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Бүтэц

| Хавтас | Агуулга |
| --- | --- |
| `src/app/` | Хуудаснууд: `/`, `/models/[slug]/`, `/register/`, `/warranty/` |
| `components/layout/` | `SiteHeader` (ангиллын dropdown), `SiteFooter`, `SiteChrome` |
| `components/hero/` | `HeroCarousel` (слайдерын удирдлага), `HeroSlide` (нэг загварын слайд) |
| `components/cards/` | `ModelGrid` (шүүлтүүр + grid), `ModelSpecCard` (загварын карт) |
| `components/home/` | Нүүр хуудасны бусад хэсэг: `HomeSections`, `PollCard` |
| `components/model/` | `ModelPage` — бүх загварын нэг template, `Blocks`, `AdasTabs`, хувилбар солих (`Variant`) |
| `components/forms/` | `SavingsCalculator`, `RegistrationForm`, `TestDriveForm` |
| `components/ui/` | Олон газар ашиглагддаг: `Slider`, `SectionTitle`, `VideoPoster`, `QuickSpecs` |
| `components/styleguide/` | `/styleguide` хуудасны туслах хэсгүүд |
| `src/data/` | Бүх контент: загварууд, цэс, нүүр хуудас |
| `src/styles/` | Хуучин сайтаас шилжүүлсэн CSS (дизайн 1:1) |
| `public/assets/` | Зураг, видео, icon |

## Контент засах

### Supabase (Test Ruichi төсөл → Table Editor)

Засварууд сайтад **1 минутын дотор** гарна, дахин deploy хийх шаардлагагүй.

| Хүснэгт | Юуг удирдана |
| --- | --- |
| `categories` | Цэсний ангиллын нэр, дараалал (`sort`) |
| `model_listings` | Аль ангилалд аль загвар, ямар дарааллаар (цэс, footer, "Бүх загвар" карт). `active=false` бол нуугдана |
| `models` | Загварын нэр, тайлбар, icon-той үзүүлэлт (хөтлөгч, суудал, даац, хаалга, хэмжээ …) |
| `model_stats` | Гол тоонууд (430 км, 61.94 кВт·ц …). Эхний 3 нь карт дээр гарна |
| `hero_slides` | Нүүр хуудасны слайд: дараалал, өнгө, текст, зураг. `active=false` бол нуугдана |
| `spec_rows` | "Техникийн үзүүлэлт" хүснэгт. `cells[1]` = мөрийн нэр, бусад нь утгууд |

Холболт: `.env.local` (загвар нь `.env.example`). Vercel дээр мөн ижил 2 хувьсагчийг Settings → Environment Variables-д нэмнэ.
Хүснэгтийн бүтэц `supabase/migrations/`, анхны өгөгдөл `supabase/seed.sql`-д байна.

### Кодонд

- **Загварын хуудасны бүтэц (hero зураг, галерей):** `src/data/catalog.ts`
- **EC75, R5-ын дэлгэрэнгүй хэсгүүд (ADAS, аюулгүй байдал …):** `src/data/ec75.ts`, `src/data/r5.ts`
- **Нүүр хуудасны бусад хэсэг (санал асуулга, зургийн цомог):** `src/data/home.ts`

Шинэ загвар нэмэх: `catalog.ts`-д хуудсыг нь нэмж, зургийг `public/assets/` (картын зураг `public/assets/thumbs/<key>.jpg`) руу хуулна.
Дараа нь Supabase-д `models`, `model_stats`, `model_listings`, хүсвэл `hero_slides`, `spec_rows`-д мөр нэмнэ.
Кодонд хуудасгүй загвар цэс, карт, слайдад харагдахгүй.

## Загварын шийдэл

`tailwind.config.ts` нь `src/styles/site.css`-ийн CSS хувьсагчдыг (өнгө, radius, фонт, зай) Tailwind theme болгосон.
Tailwind-ийн `preflight` болон `container` унтраалттай, учир нь хуучин CSS өөрийн суурь загвартай.
Utility class-ууд хуучин CSS-ийн дараа ачаалагддаг тул түүнийг дарж бичиж болно.

Хуучин `c5.html`, `ec75.html#cargo` зэрэг URL-ууд `/models/<slug>/` руу 308 redirect хийгдэнэ (`src/data/redirects.ts`).
