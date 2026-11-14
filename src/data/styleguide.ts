// Content for /styleguide. Token values are read live from the browser
// (components/StyleguideLive.tsx); this file only names and explains them.

export const sections = [
  { id: "principles", num: "01", title: "Зарчим" },
  { id: "brand", num: "02", title: "Брэнд" },
  { id: "color", num: "03", title: "Өнгө" },
  { id: "type", num: "04", title: "Үсэг" },
  { id: "spacing", num: "05", title: "Зай" },
  { id: "shape", num: "06", title: "Хэлбэр" },
  { id: "stroke", num: "07", title: "Шугам" },
  { id: "shadow", num: "08", title: "Сүүдэр" },
  { id: "icons", num: "09", title: "Дүрс" },
  { id: "components", num: "10", title: "Компонент" },
  { id: "page-sections", num: "11", title: "Хэсгүүд" },
  { id: "motion", num: "12", title: "Хөдөлгөөн" }
];

export const principles = [
  { title: "Нэг ногоон өнгө", text: "Ruichi ногоон (#0f5a3a) нь бүх үйлдлийн товч, идэвхтэй төлөв, цэсийн өнгө. Бусад өнгө нь саарал, цагаан." },
  { title: "Зураг төвтэй", text: "Tesla.com-ийн бүтэц: бүтэн дэлгэцийн машины зураг, дээр нь цөөн үг, хоёр гол товч." },
  { title: "Нэг фонт", text: "Inter (кирилл, латин) — гарчиг, бичвэр, товч бүгдэд. Гарчиг 700, товч 600, бичвэр 400." },
  { title: "Тайван хөдөлгөөн", text: "Богино, зөөлөн шилжилт (0.2–0.6 сек). Хөдөлгөөн багасгах тохиргоог хүндэтгэнэ." }
];

export const colorGroups = [
  {
    title: "Үндсэн токен (site.css :root)",
    tokens: [
      { name: "--color-background", use: "Хуудасны дэвсгэр" },
      { name: "--color-surface", use: "Карт, хүснэгт, хайрцаг" },
      { name: "--color-surface-hover", use: "Карт, мөр дээр хулгана очиход" },
      { name: "--color-text", use: "Гол бичвэр, гарчиг" },
      { name: "--color-text-secondary", use: "Тайлбар бичвэр" },
      { name: "--color-text-muted", use: "Tagline, жижиг тэмдэглэл" },
      { name: "--color-border", use: "Хүрээ, тусгаарлагч шугам" },
      { name: "--color-primary", use: "Товч, холбоос, идэвхтэй төлөв" },
      { name: "--color-primary-hover", use: "Товч дээр хулгана очиход" },
      { name: "--color-white", use: "Бараан дэвсгэр дээрх бичвэр" },
      { name: "--color-hero-sky", use: "Hero-ийн дээд хэсгийн өнгө (слайд бүрт өөр)" }
    ]
  }
];

export const brandColors = [
  { hex: "#0f5a3a", name: "Ruichi ногоон", use: "Товч, navbar" },
  { hex: "#083d28", name: "Гүн ногоон", use: "Hover, footer-ийн бүсүүд" },
  { hex: "#147a48", name: "Тод ногоон", use: "Tagline, цэсийн идэвхтэй бичвэр" },
  { hex: "#eef5f3", name: "Ногоон манан", use: "Цэс, сонголтын цайвар дэвсгэр" },
  { hex: "#f5f7fa", name: "Цайвар саарал", use: "Хуудасны дэвсгэр" },
  { hex: "#14213d", name: "Бараан хөх", use: "Гарчиг, гол бичвэр" }
];

export const typeTokens = ["--heading-1", "--heading-2", "--heading-5", "--heading-6", "--text-medium", "--text-regular", "--text-small", "--text-tiny", "--stat-number"];

export const spacingTokens = [
  { name: "--padding-global", use: "Хуудасны хоёр талын зай (утсанд 20px)" },
  { name: "--padding-section-large", use: "Хэсгийн дээд, доод зай" },
  { name: "--padding-section-medium", use: "Жижиг хэсгийн зай" },
  { name: "--gap-section", use: "Хэсэг доторх блокуудын зай" },
  { name: "--navbar-height", use: "Дээд цэсний өндөр" }
];

export const radii = [
  { label: "--radius-button", value: "var(--radius-button)", use: "Товч" },
  { label: "--radius-card", value: "var(--radius-card)", use: "Карт, зураг" },
  { label: "18px", value: "18px", use: "Загварын хуудасны том зураг" },
  { label: "999px", value: "999px", use: "Pill — хувилбар сонгогч" },
  { label: "50%", value: "50%", use: "Тойрог — сошиал icon" }
];

export const shadows = [
  { name: "Товч", value: "0 8px 18px rgb(15 90 58 / .2)", use: ".btn, .slider__arrow" },
  { name: "Карт", value: "0 10px 30px rgb(15 35 56 / .09)", use: ".mcard, .gallery__item, .cta--warranty" },
  { name: "Dropdown", value: "0 18px 45px rgb(15 35 56 / .14)", use: ".navmenu__panel" },
  { name: "Хүснэгт", value: "0 8px 24px rgb(15 35 56 / .07)", use: ".mspec-table" },
  { name: "Navbar", value: "0 2px 14px rgb(8 61 40 / .22)", use: ".navbar.is-solid" }
];

// `future: true` — icon is wired up in QuickSpecs but no current model needs it yet.
export const quickIcons = [
  { file: "01_van.png", use: "Фургон — EC75, R5, EC35II" },
  { file: "02_light_flatbed_truck.png", use: "Задгай тэвш — C5, C3, ED71S" },
  { file: "03_light_box_truck.png", use: "Битүү тэвш — C9, EC31" },
  { file: "04_refrigerator_truck.png", use: "Хөргүүртэй — C3 Хөргүүртэй" },
  { file: "05_flatbed_4door_truck.png", use: "4 хаалгатай тэвш — C5 CNG, C5 Бензин, C5 Дрон" },
  { file: "06_FWD.svg", use: "Урд хөтлөгч (урд дугуй дүүрэн)" },
  { file: "07_AWD.svg", use: "Бүх дугуй хөтлөгч — шинэ загварт", future: true },
  { file: "08_RWD.svg", use: "Хойд хөтлөгч (хойд дугуй дүүрэн)" },
  { file: "09_fuel.svg", use: "Түлш — BEV, EREV, PHEV (бүх загвар)" },
  { file: "10_dimension.svg", use: "Хэмжээ" },
  { file: "11_doors.svg", use: "Хаалга" },
  { file: "12_charging.png", use: "Цэнэглэх хугацаа", future: true },
  { file: "13_range.svg", use: "Туулах зай (EREV/PHEV-д нийт зай)" },
  { file: "17_engine.svg", use: "Хөдөлгүүр — зөвхөн EREV, PHEV загвар" },
  { file: "15_seats.svg", use: "Суудал (суудал × хүн — тоог илэрхийлнэ)" },
  { file: "16_payload_filled.svg", use: "Даац — утга оруулсан үед л харагдана" }
];

export const uiIcons = [
  { file: "arrow-back.svg", use: "Слайдер — өмнөх" },
  { file: "arrow-forward.svg", use: "Слайдер — дараах" },
  { file: "chevron-right.svg", use: "Холбоос товч" },
  { file: "close.svg", use: "Тооцоолуурын цонх хаах" },
  { file: "play-button.svg", use: "Видео тоглуулах" }
];

export const pageSections = [
  { page: "Нүүр хуудас", href: "/", items: [
    ["HeroCarousel + HeroSlide", "Загвар бүрийн бүтэн дэлгэцийн слайд", "/"],
    ["PollCard", "−30°C санал асуулга ба видео", "/"],
    ["ModelGrid", "Бүх загварын карт, ангиллаар шүүх", "/#models"],
    ["CtaBlock", "Урамшуулал, баталгаа", "/"],
    ["ChargerStats", "Цэнэглэгчийн тоо ба газрын зураг", "/#chargers"],
    ["GallerySlider", "Зургийн цомог", "/"],
    ["TestDriveSection", "Туршилтын жолоодлогын маягт", "/#test-drive"]
  ] },
  { page: "Загварын хуудас (ModelPage)", href: "/models/ec75/", items: [
    ["Hero / Intro", "EC75, R5: бүтэн зураг · бусад: төвлөрсөн зураг", "/models/c5/"],
    ["Stats", "4 гол үзүүлэлт + 2 товч", "/models/c5/"],
    ["Feature", "Зураг + текст + баримтууд", "/models/ec75/#cargo-space"],
    ["Cards slider", "Ажлын бүтэц, кабин", "/models/ec75/#interior"],
    ["AdasTabs", "Жолоочийн туслах функц", "/models/ec75/#assist"],
    ["Safety", "Аюулгүй байдлын карт + chip", "/models/ec75/#safety"],
    ["SpecGroups", "Хувилбартай үзүүлэлт + харьцуулалт", "/models/r5/#specs"],
    ["SpecTable", "Дэлгэрэнгүй техникийн хүснэгт", "/models/c5/#specs"],
    ["EndCta", "Төгсгөлийн уриалга", "/models/ec75/#test-drive"]
  ] },
  { page: "Бусад", href: "/register/", items: [
    ["RegistrationForm", "Бонус бүртгэл", "/register/"],
    ["Warranty", "Баталгаат хугацаа", "/warranty/"]
  ] }
];

export const motion = [
  { name: "Hero слайд шилжилт", kind: "Macro", spec: "transform 0.6s ease · 7 сек тутам автоматаар · 50px-ээс их чирэхэд шилжинэ", where: "HeroCarousel" },
  { name: "Ил тод → цул navbar", kind: "Macro", spec: "8px-ээс доош гүйлгэхэд is-solid · background 0.33s", where: "SiteHeader" },
  { name: "Ангиллын dropdown", kind: "Macro", spec: "Хулгана/дарахад нээгдэнэ · гарахад 180ms хүлээж хаагдана · Esc", where: "SiteHeader" },
  { name: "Гүйдэг мессеж", kind: "Macro", spec: "4 мессеж · 16 сек давталт · баруунаас орж ирнэ", where: "EC75 hero" },
  { name: "Карт гүйлгэх", kind: "Macro", spec: "Сум дарахад нэг карт · scroll-snap", where: "Slider" },
  { name: "Товч дээр хулгана", kind: "Micro", spec: "translateY(-1px) · сүүдэр томорно · 0.2s", where: ".btn" },
  { name: "Хувилбар солих", kind: "Micro", spec: "Зураг, текст шууд солигдоно · URL #cargo / #passenger", where: "VariantToggle" },
  { name: "Видео poster", kind: "Micro", spec: "Дарахад зургийн оронд видео тоглоно", where: "VideoPoster" },
  { name: "ADAS tab", kind: "Micro", spec: "Сонгосон функцын зураг opacity-оор солигдоно", where: "AdasTabs" },
  { name: "Хөдөлгөөн багасгах", kind: "Дүрэм", spec: "prefers-reduced-motion үед autoplay, хөдөлгөөн зогсоно", where: "Бүх" }
];
