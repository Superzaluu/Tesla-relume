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
| `components/` | Бүх component нэг хавтсанд (төслийн үндсэн хавтаст): `SiteHeader`, `SiteFooter`, `HeroCarousel`, `ModelPage` (бүх загварын нэг template), `SavingsCalculator` гэх мэт |
| `src/data/` | Бүх контент: загварууд, цэс, нүүр хуудас |
| `src/styles/` | Хуучин сайтаас шилжүүлсэн CSS (дизайн 1:1) |
| `public/assets/` | Зураг, видео, icon |

## Контент засах

- **Цэс, footer, ангилал:** `src/data/navigation.ts`
- **Энгийн загварууд (C5, C3, EC31 …):** `src/data/catalog.ts`
- **EC75, R5-ын дэлгэрэнгүй хуудас:** `src/data/ec75.ts`, `src/data/r5.ts`
- **Техникийн хүснэгт:** `src/data/specs/<slug>.txt` (машин орчуулга; build үед уншигдана)
- **Нүүр хуудасны слайд:** `src/data/home.ts`

Шинэ загвар нэмэх: `catalog.ts`-д мөр нэмж, `navigation.ts`-д ангилалд нь оруулаад зургийг `public/assets/` руу хуулна.

## Загварын шийдэл

`tailwind.config.ts` нь `src/styles/site.css`-ийн CSS хувьсагчдыг (өнгө, radius, фонт, зай) Tailwind theme болгосон.
Tailwind-ийн `preflight` болон `container` унтраалттай, учир нь хуучин CSS өөрийн суурь загвартай.
Utility class-ууд хуучин CSS-ийн дараа ачаалагддаг тул түүнийг дарж бичиж болно.

Хуучин `c5.html`, `ec75.html#cargo` зэрэг URL-ууд `/models/<slug>/` руу 308 redirect хийгдэнэ (`src/data/redirects.ts`).
