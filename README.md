# Ruichi Mongolia — Next.js

Next.js App Router, TypeScript болон Tailwind CSS ашигласан статик export сайт.

## Ажиллуулах

Node.js 20 буюу түүнээс шинэ хувилбар шаардлагатай.

```bash
npm install
npm run dev
```

Production статик хувилбар гаргах:

```bash
npm run build
```

`out/` хавтсыг static hosting-д байршуулна. `prebuild` алхам нь хуучин `c3.html`, `r5.html` зэрэг URL-ийг `/models/[slug]/` руу чиглүүлэх HTML redirect-уудыг `public/` дотор бэлтгэнэ.

Автомашины агуулгыг `src/data/models.ts`, navigation ангиллыг `src/data/navigation.ts` файлаас удирдана.
