---
name: model-page-standard
description: The standard for every Ruichi model page (/models/<slug>/), set on the C5 page on 2026-11-20. Use when building, changing, reviewing or adding a model page, adding a model or its photos, touching ModelPage / ConfigPicker / Chapters / story.ts / specSheet.ts / model.css, or when asked to make a model page "like C5" or check it against the style guide.
---

# Model page standard (C5 = reference page)

Every model page is ONE template (`components/model/ModelPage.tsx`). A change made for one model reaches all
26 pages, so never fork per model; fix the template or the data. `/models/c5/` is the reference: when unsure
how something should look or behave, open C5 and match it.

## Page order (top to bottom)

1. **Hero** (`Hero` in ModelPage.tsx)
   - `intro` kind (every model): name, descriptor, photo 1100 × clamp(360px, 34vw, 460px),
     `object-position: 50% 80%` so the vehicle sits in the middle. No category line, no tagline sentence, no
     buttons here: «Урьдчилсан захиалга» and «Хэмнэлтийн тооцоолуур» live in the menu.
   - EC75 / R5 use the same `intro` hero since 2026-11-21 (the full-bleed `photo` kind put the icons over the
     van and hid the name): the Ачааны / Зорчигчийн switch sits next to the calculator, the photo follows it
     (`image.src` per variant), `position: "50% 50%"` because their studio photos were extended to 1100 × 750
     with the van in the middle (scratchpad widen2.ps1: sides, top and bottom continued, seams feathered).
   - **Icon strip** (`components/ui/QuickSpecs.tsx`): 9 fixed slots on the photo's bottom edge, one row on
     desktop, dark green #083d28 with a white glow. A slot with a photo below gets a **QuickPeek** card on
     hover / first tap (`components/ui/QuickPeek.tsx`, peeks built in `story.ts collectPeeks`, slot → photo
     map `PEEK_SLOTS`); a click jumps to that section / card (e.g. seats → the cabin card in «Аюулгүй ба
     ухаалаг»). EC75 / R5 (hand-written sections) get theirs from `peeksFromSections` (section ids + card titles).
     Check: `scripts/peek-test.mjs <url> <iconIndex> <out.png>`.
2. **ModelNav** (sticky, `components/model/ModelNav.tsx`): outlined pills «Эхлэл · Ачаа · Хүч ба цэнэглэлт ·
   Аюулгүй ба ухаалаг · Иж бүрдэл · Зураг · Ногоон зээл» (green outline, own page), then on the right one
   group: green «Урьдчилсан захиалга», outlined «Хэмнэлтийн тооцоолуур», green «Туршилтын жолоодлого».
   Only items the model has.
3. **Chapters** (`components/model/Chapters.tsx`, Gestalt common region): sections grouped by id into three
   pale-green boxes (#eef5f3, radius 18px):
   - `load` «Ачаа ба бүтэц»: `cargo-space`, `space`, `work`, `service` (never id `cargo`: #cargo / #passenger
     are the EC75 / R5 side switch, an element with that id makes the browser skip the hero)
   - `power` «Хүч ба цэнэглэлт»: `battery`, `charging`, `winter` (+ the sheet's WinterSection with the EC75
     −30°C video, captioned as EC75's test)
   - `smart` «Аюулгүй ба ухаалаг»: `assist`, `safety`, `interior` → ONE `SmartGrid` of equal cards with
     filter pills (Бүгд / Туслах систем / Аюулгүй байдал / Кабин). Column count leaves no lone card
     (12 → 4×3, 9 → 3×3); 5/13/17 cards → first card 2×2.
   New section ids must be added to `CHAPTERS` or they render as a loose band after the chapters.
4. **Иж бүрдэл** (`SpecSheetSection` → `ConfigPicker.tsx`):
   - R5 / EC75 only: **«Хүчний сонголт»** cards first (R5 | R5 Pro: battery, motor, range); the Pro's own sheets
     are merged in (`src/data/pro.ts`), its menu cards hidden, its URLs redirect here. Switching power keeps
     the trim's rank;
   - trim cards, **best trim first** (most standard equipment, then price; sorted in `viewSheet`), it is
     the default pick;
   - **Тоноглол**: every item any trim has as chips by group, two columns (largest groups left, wider).
     ✓ green = this trim, ○ = optional, – white struck = not in this trim. Chips never move on a trim
     switch; only state flips (mark pops). Differing items first in each group. Click a chip → its
     explanation opens under the group (label, state, hint). Group text rows (screen, airbags, tyres…)
     as one line under the chips, first 4 then «Дэлгэрэнгүй (+N)»;
   - **Техник үзүүлэлт**: only the core groups (Ерөнхий, Хэмжээ ба жин, Мотор, Батерей ба цэнэглэлт,
     extender) as equal-height cards; key-number rows first with icons; mark rows show a ✓/○/– circle
     left of the label; values that differ from the previous trim flash once;
   - «Иж бүрдлүүдийг харьцуулах» table (folded).
5. **«Гадна ба дотор орчин» album** (`Album` in ModelPage.tsx, data `src/data/albums.ts`): up to 6 photos of
   THIS model, first one large (2×2), caption (title + one line, optional tag) on the photo over a dark-green
   scrim; no photo twice, never another model's photo. C5 family: the C5 winter-test photos first («Өвлийн
   туршилт» tag); EC75: frames of its −30°C test video. ED71S = C5 BEV with leaf springs front and rear, so it
   may use C5 photos except chassis/brakes (tag says it is the C5's test). Then «Төстэй загварууд», notes.

## Rules that are easy to break

- **Nothing twice.** Before adding a block, check the fact is not already on the page (hero strip, chips,
  core cards). Removed for this reason: stats strip, «Бүх иж бүрдэлд стандартаар» chips, connected-feature
  list, equipment spec cards, end CTA «Туршаад үзэх үү?», ActionBar band.
- **No placeholders.** A missing photo is left out (`hasPicture` in Blocks.tsx, `pictured` in SmartGrid):
  feature → full-width text (`mfeature--solo`), card → text card (`mcard--text`), wide image → skipped.
  Never invent or borrow another model's photo (a flatbed photo on a box model is false).
- **Every chip has an explanation.** New equipment mark fields in `specSheet.ts FIELDS` need a `hint`
  (general function, no model-specific numbers). Text fields that people look for as a chip go in
  `CHIP_FROM_TEXT` (EPB, USB / Type-C).
- **Data stays in the sheet.** Copy never claims more than the spec sheet; EC75/R5 hand-written sections
  live in `src/data/ec75.ts`, `r5.ts`, all others are built by `src/data/story.ts`.
- **Savings calculator is per model.** The quick window (homepage section as a modal) calculates only the
  page's model (`getCalculatorModel(slug)`, also for models not in the menu); «Дэлгэрэнгүй тооцоолох»
  opens the full calculator on the same model.

## Style guide (src/data/styleguide.ts, /styleguide/)

- Colours: one green family only — #0f5a3a (buttons, active), #083d28 (hover, hero icons), #147a48
  (taglines, kickers, focus), #eef5f3 (pale fills, chapter boxes); everything else from the neutral tokens
  (#14213d text, #344054, #667085 muted, #dce3ea border, #eef3f7 inner rules, #f5f7fa page, #fff).
  No sand, blue, yellow or other greens; tints derived from the brand green as `rgb(15 90 58 / a)`.
- Type: Inter; headings 700, buttons 600, body 400; sizes via `--text-tiny/small/regular/medium`,
  `--heading-5`, `--stat-number` (no raw 12–17px).
- Radius: `--radius-button` (12), `--radius-card` (14), 18px for large page pictures and chapter boxes,
  999px pills.
- Shadows: only the four guide shadows (button, card, dropdown, table); hovered cards use the dropdown one.
- Check with: `rg -o "#[0-9a-fA-F]{6}" src/styles/model.css | sort | uniq -c` — anything outside the list
  above is a bug (two legacy dark-theme values are known dead code).

## Motion (variant A «Зөөлөн өргөлт», one curve `--ease-out: cubic-bezier(.2,.8,.2,1)`)

- Cards lift −4px (spec cards, trims −2px) with the dropdown shadow, 0.3s; pictures zoom ×1.04, 0.8s.
- Buttons and menu pills lift −1px with the button shadow, 0.2s; press ×0.97.
- Chip / check marks pop from ×0.5, 0.35s; changed values flash pale brand green 1.6s.
- Entrance: `RevealOnScroll` — below-the-fold blocks rise 16px and fade in, 0.6s, 70ms stagger; the page is
  complete without JS.
- «Хэмнэлтийн тооцоолуур» (since 2026-11-21): in the sticky ModelNav between «Урьдчилсан захиалга» and
  «Туршилтын жолоодлого» (the three actions are one right-hand group `.mnav__actions`; the section links scroll
  sideways with a fade when space runs out, all fit from 1440px). Magnetic there (`components/ui/Magnetic.tsx`).
  At the first real mouse movement the button lifts off from its menu place (its slot stays empty) and follows
  the mouse at ~56px (`FloatingSavings.tsx`), waits when the mouse heads for it, and stops for the session once
  clicked (then it stays in the menu; test in a new tab). Waiting for the hero to scroll away was tried and read
  as "it does not move" (user, 2026-11-21). Phones (<768px): no menu slot, it waits bottom-right. It follows
  on any real mouse movement, not on media-query guesses. Check: `scripts/float-test.mjs <url> <outPrefix>`.
- Reduced motion: entrance and autoplay stop; small hover/press feedback stays (the owner's Windows
  machine reports reduced motion — gating hover on it made the site look dead). No light sweeps on
  pictures (tried, rejected).

## Checking a change (do this before saying "done")

1. `npx tsc --noEmit -p .`
2. Dev server: reuse the one on :3001 if it runs; do NOT start a second `next dev` (shared `.next`).
3. Audit every model page: `node .claude/skills/model-page-standard/scripts/audit-models.mjs` — every row
   should have the hero strip (9), 3 chapters (except models without a sheet), trims, equipment groups,
   core cards, savings button, preorder in the menu, and no rendered `coming-soon.svg` except where the
   photo genuinely does not exist yet (report those to the user).
4. Look at it: `node .claude/skills/model-page-standard/scripts/page-strips.mjs <url> <outDir> <prefix>`
   (full page in strips, reveal forced visible, lazy images loaded) or `section-shot.mjs <url> <selector>
   <out.png> [w] [h] [clickSelector]`. Both drive headless Edge over CDP; hover/scroll tests need real
   `Input.dispatchMouseEvent` and instant scrolls (`behavior:'instant'`), and measure after scrolling.
5. Known traps: `history.replaceState` in a client handler makes Next re-render and undo DOM state;
   IntersectionObserver was unreliable for the floating button in headless runs (use scroll + rect);
   editing files with PowerShell `Get-Content`/`Set-Content` without `-Encoding utf8` corrupts Cyrillic —
   use the Edit tool or `[IO.File]::ReadAllText/WriteAllText` with UTF-8.

## Open data gaps (2026-11-20)

Story photos come from the model's own rc-ev.com page (`/cms/a/<CODE>.html`: banner, «车型概览» posters,
«精彩图集» gallery), cropped with no overlay text and only of the page's own body; models with part of a set
are in `story.ts STORY_SOME` (2026-11-20: EC75 Pro ×2, R5 Pro ×2, C3, C3 cold, C5L, C9, EC31/L/S, EC35).
rc-ev's menu images (`/cms/c/ZYC.html`, 640×310 PNG on transparent → flatten on white) gave C3 cold and
ED71S their cargo photos. rc-ev's «精彩图集» gallery lazy-loads (a plain download gets 8 KB placeholders); the
same studio photos at 1400×1050 are on exporter pages such as main-newenergy.com (C5L cabin/seats/side came
from there, 2026-11-21) — check the plate / rear-door badge is the right model before using one. Third-party sites (Yiche/Autohome captcha, 360che, yunshuren) are watermarked and
not used. The single-cab C5 box (c5-box, c5-cng-box, c5-reev-box) IS the C5L box truck (user, 2026-11-21): hero
/assets/hero/c5-box.jpg (C5L studio photo, no plate, backdrop widened to 2.4:1), card /assets/thumbs/c5-box.jpg,
cargo photo = C5L side; wired in content.ts `SHIPPED`, used while the admin row still holds coming-soon.svg.
Still without photos: R5 service story (no sheet), C3 cold album. r5-service has no spec
sheet (no chapters, no trims). These need real photos / sheet data from the user, not code.
