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

### Admin: `/admin`

Supabase Auth-ийн бүртгэлээр нэвтэрнэ. Засах эрх нь зөвхөн `public.admins` хүснэгтэд бүртгэлтэй хэрэглэгчид бий (RLS).
Хадгалсан өөрчлөлт сайтад **шууд** гарна, дахин deploy хийх шаардлагагүй.

- **Машины карт:** карт нэмэх (шинэ загвартай эсвэл байгаа загварт), засах, нуух/сэргээх. Загварын нэр, тайлбар, icon-той мэдээлэл, гол үзүүлэлт, техникийн хүснэгт, зураг.
- **Hero слайд:** слайд нэмэх, текст, зураг, өнгө, дараалал, нуух/сэргээх.
- Мөрийг устгадаггүй, нуудаг. Зураг Supabase Storage-ийн `site-images` bucket-д хадгалагдана (4 MB хүртэл).
- Admin-аас нэмсэн, кодонд хуудасгүй загварт стандарт хуудас автоматаар үүснэ (`/models/<slug>/`). Карт нь нуугдвал хуудас нь ч хаагдана.

Шинэ admin нэмэх: Supabase → Authentication → Users → **Add user** (Auto Confirm), дараа нь SQL Editor дээр
`insert into public.admins (user_id) select id from auth.users where email = '<и-мэйл>';`

### Supabase хүснэгтүүд (Test Ruichi төсөл)

| Хүснэгт | Юуг удирдана |
| --- | --- |
| `categories` | Цэсний ангиллын нэр, дараалал (`sort`) |
| `model_listings` | Карт: аль ангилалд аль загвар, ямар дарааллаар, зураг (`thumb`). `active=false` бол нуугдана |
| `models` | Загварын нэр, тайлбар, icon-той мэдээлэл, `stats` (гол тоонууд), `spec` (техникийн хүснэгт) |
| `hero_slides` | Нүүр хуудасны слайд. `active=false` бол нуугдана |
| `admins` | Засах эрхтэй хэрэглэгчид |
| `model_stats`, `spec_rows` | Хуучирсан (`models.stats`, `models.spec` руу шилжсэн), сайт ашиглахгүй |

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
