import { CHASSIS } from "./ec75";
import type { Card, Img, Model } from "./types";

const img = (file: string, width: number, height: number, alt: string): Img => ({ src: `/assets/r5/${file}`, width, height, alt });
const card = (file: string, h: number, title: string, text: string, alt: string, tag?: string): Card =>
  ({ image: img(file, 800, h, alt), title, text, tag });

export const r5: Model = {
  slug: "r5",
  name: "R5",
  desc: "Цахилгаан фургон",
  // R5 (58.24 kWh) with R5 Pro (61.94 kWh, 130 kW) as a power choice on this page (src/data/pro.ts, 2026-11-21).
  // quick / stats below are fallbacks: Supabase's row, widened by the Pro rows, is what shows.
  quick: { type: "van", label: "Фургон", size: "5170 x 1860 x 2020 мм", range: "401–403 км", drive: "FWD", fuel: "BEV", doors: "5 хаалга", charge: "DC - 18 мин", seats: "2 суудал", seatsPassenger: "6–9 суудал", payload: "1,500–2,000 кг" },
  page: {
    pageTitle: "Цахилгаан фургон",
    variants: true,
    // Standard intro hero like C5 (user, 2026-11-21): one studio photo per side, the backdrop extended to 1100 × 750
    // with the van in the middle, shown from the centre, so the whole van fits the desktop frame and stays above the
    // icon strip on phones; the cargo / passenger switch sits next to the calculator.
    hero: {
      kind: "intro", maxWidth: 1100, position: "50% 50%",
      image: {
        src: { cargo: "/assets/hero/r5-cargo.jpg", passenger: "/assets/hero/r5-passenger.jpg" }, width: 1100, height: 750,
        alt: { cargo: "Ногоон R5 ачааны фургон", passenger: "Цагаан R5 зорчигчийн фургон" }
      }
    },
    stats: [
      { value: { cargo: "401", passenger: "403" }, unit: "км", label: "Туулах зай (CLTC)", note: 1 },
      { value: "18", unit: "мин", label: "Хурдан цэнэглэлт 20–80%" },
      { value: { cargo: "70", passenger: "100" }, unit: "кВт", label: "Моторын оргил чадал" },
      { value: { cargo: "7.7", passenger: "6–9" }, unit: { cargo: "м³", passenger: "суудал" }, label: { cargo: "Ачааны багтаамж", passenger: "Суудлын тоо" } }
    ],
    statsSecondary: "test-drive",
    sections: [
      { id: "space", blocks: [{
        type: "feature",
        image: {
          src: { cargo: "/assets/r5/cargo-side-door.jpg", passenger: "/assets/r5/pass-side-door.jpg" }, width: 800, height: 450,
          alt: { cargo: "Хажуугийн хаалга нь онгорхой R5 ачааны фургон", passenger: "Хажуугийн хаалга нь онгорхой R5 зорчигчийн фургон" }
        },
        tagline: { cargo: "Ачааны тасалгаа", passenger: "Суудлын байрлал" },
        title: { cargo: "Ажилд зориулсан багтаамж", passenger: "Бүх хүндээ эвтэйхэн" },
        text: {
          cargo: "3,025 × 1,750 × 1,455 мм хэмжээтэй, 7.7 м³ багтаамжтай ачааны тасалгаа. Хоёр талын гүйдэг хаалга болон 180° нээгддэг арын хаалгаар ачаагаа хаанаас ч ачиж буулгана.",
          passenger: "2+2+2 буюу 6 суудалтай, эсвэл 2+2+2+3 буюу 9 суудалтай. Арын суудлын түшлэг эвхэгдэж, 22 инчийн 17 чемодан багтах ачааны зай гаргана."
        },
        facts: {
          cargo: [{ label: "Багтаамж", value: "7.7 м³" }, { label: "Тэнхлэг хоорондын зай", value: "3,200 мм" }, { label: "Шал", value: "PVC" }],
          passenger: [{ label: "Суудал", value: "6 эсвэл 9" }, { label: "Агааржуулагч", value: "2 ууршуулагч" }, { label: "Ачаа тээш", value: "17 чемодан" }]
        }
      }] },
      { id: "work", tone: "tight", blocks: [
        { type: "title", title: "Хоёр хувилбар, нэг платформ", text: "Ачааны болон зорчигчийн хувилбар хоёулаа 5,170 мм урт, 1,860 мм өргөн их биетэй." },
        { type: "cards", items: [
          card("cargo-rear.jpg", 450, "180° арын хаалга", "Арын хаалга бүрэн нээгдэж, ачааны тасалгаа руу шууд хандана.", "R5 ачааны фургоны онгорхой арын хаалга"),
          card("cargo-side.jpg", 450, "1.86 м өргөн их бие", "Кабин болон ачааны тасалгаанд илүү их зай.", "R5 ачааны фургон хажуугаас"),
          card("pass-side-door.jpg", 450, "Хоёр талын гүйдэг хаалга", "Зорчигчид хоёр талаас нь сууж бууна.", "R5 зорчигчийн фургоны онгорхой гүйдэг хаалга"),
          card("pass-rear.jpg", 450, "Эвхэгддэг суудал", "Арын эгнээний түшлэгийг эвхэж ачаа тээшинд зай гаргана.", "R5 зорчигчийн фургоны арын хэсэг ба суудал")
        ] }
      ] },
      { id: "battery", tone: "dark", blocks: [
        { type: "feature", reverse: true, image: img("glow.jpg", 800, 450, "Шөнийн замд гэрэлтэж буй R5"),
          tagline: "Батерей ба цэнэглэлт", title: "R5 эсвэл илүү хүчтэй R5 Pro",
          // R5 Pro is a power choice on this page since 2026-11-21 (src/data/pro.ts); numbers from both sheets.
          text: {
            cargo: "Шингэн хөргөлттэй литийн төмрийн фосфат (LFP) батерей: R5 нь 58.24 кВт·ц, 70 кВт мотортой, 401 км; R5 Pro нь 61.94 кВт·ц, 130 кВт мотортой, 420 км явна. Аль аль нь 2C хурдан цэнэглэлтээр 20%-аас 80% хүртэл 18 минутад цэнэглэгдэнэ.",
            passenger: "Шингэн хөргөлттэй литийн төмрийн фосфат (LFP) батерей: R5 нь 58.24 кВт·ц, 100 кВт мотортой, 403 км; R5 Pro нь 61.94 кВт·ц, 130 кВт мотортой, 430 км явна. Аль аль нь 2C хурдан цэнэглэлтээр 20%-аас 80% хүртэл 18 минутад цэнэглэгдэнэ."
          },
          facts: {
            cargo: [{ label: "Батерей", value: "58.24 / 61.94 кВт·ц" }, { label: "Мотор", value: "70 / 130 кВт" }, { label: "Дээд хурд", value: "90 / 100 км/ц" }],
            passenger: [{ label: "Батерей", value: "58.24 / 61.94 кВт·ц" }, { label: "Мотор", value: "100 / 130 кВт" }, { label: "Дээд хурд", value: "100 км/ц" }]
          } },
        { type: "columns", items: [
          { value: "18 мин", title: "Хурдан цэнэглэлт", text: "Хурдан цэнэглэгчээр 20%-аас 80% хүртэл 18 минутад цэнэглэгдэнэ." },
          { value: "6.6 кВт", title: "Гэр, агуулахдаа", text: "Удаан цэнэглэгчээр ойролцоогоор 8 цагт бүрэн цэнэглэгдэж, өглөө бэлэн гарна." },
          { value: "V2L", title: "Цахилгаан хуваалцах", text: "Машины зайгаас гадны багаж, төхөөрөмжөө тэжээнэ. Тоормослох үед энерги сэргээнэ." }
        ] }
      ] },
      { id: "service", tone: "surface", blocks: [{
        type: "feature", image: img("service-interior.jpg", 800, 533, "Багаж хэрэгслээр тоноглосон R5 үйлчилгээний фургоны дотор тал"),
        tagline: "Тусгай зориулалт", title: "Явуулын засварын газар",
        text: "R5-ын үйлчилгээний хувилбар нь ачааны тасалгаандаа тавиур, багажны шүүгээ, засварын тоног төхөөрөмж байрлуулж, үйлчилгээгээ үйлчлүүлэгч дээр нь хүргэнэ.",
        link: { label: "Тохиргооны талаар лавлах", href: "/#test-drive" }
      }] },
      { id: "assist", blocks: [
        { type: "title", tagline: "Ухаалаг жолоодлогын хувилбар", title: "Жолоочийн туслах функцууд", text: "Камер болон радарт тулгуурласан туслах системүүд аялал бүрийг аюулгүй, ядаргаа багатай болгоно.", note: 2 },
        { type: "adas", items: [
          { id: "acc", name: "Дасан зохицох круиз контрол", code: "ACC", text: "Урд машиныг автоматаар дагаж, хурд болон зайгаа барина.", image: img("adas-acc.jpg", 800, 450, "Урд машиныг дагаж яваа R5 — ACC") },
          { id: "ica", name: "Нэгдсэн круиз", code: "TJA/ICA", text: "Түгжрэл болон хурдны замд эгнээндээ урд машиныг дагаж, жолоочийн ядаргааг бууруулна.", image: img("adas-ica.jpg", 800, 450, "Эгнээндээ төвлөрч яваа R5 — TJA/ICA") },
          { id: "aeb", name: "Яаралтай автомат тоормос", code: "AEB · FCW", text: "Урд талын зайг хянаж, мөргөлдөх эрсдэлийг анхааруулна. Шаардлагатай үед автоматаар тоормослоно.", image: img("adas-aeb.jpg", 800, 450, "Мөргөлдөх эрсдэлийг анхааруулж буй R5 — AEB/FCW") },
          { id: "ldw", name: "Эгнээ хадгалах туслах", code: "LDW · LDP", text: "Эгнээнээс гарахад анхааруулж, санамсаргүй гарсан үед жолоог залруулж эгнээнд нь буцаана.", image: img("adas-ldw.jpg", 800, 450, "Эгнээний хил дээр анхааруулж буй R5 — LDW/LDP") },
          { id: "isa", name: "Ухаалаг хурд хязгаарлагч", code: "ISA", text: "Хурдны хязгаарын тэмдгийг таньж, хэтрүүлэхгүй байхыг сануулна.", image: img("adas-isa.jpg", 800, 450, "80 км/ц хурдны хязгаар таньж буй R5 — ISA") },
          { id: "hma", name: "Ухаалаг гэрэл", code: "HMA", text: "Харанхуй болоход гэрэл автоматаар асч, эсрэг ирж буй машинд холын гэрлээ автоматаар бууруулна.", image: img("adas-hma.jpg", 800, 450, "Шөнө гэрлээ автоматаар тохируулж буй R5 — HMA") }
        ] }
      ] },
      { id: "safety", tone: "surface", blocks: [
        { type: "title", tagline: "Аюулгүй байдал", title: "Зам дээр тогтвортой" },
        { type: "safety",
          items: [
            card("safety-esc.jpg", 450, "Тогтвортой байдлын систем", "Огцом эргэлт, хальтиргаатай замд гулгахаас сэргийлнэ.", "Саад тойрч буй R5-ууд — ESC", "ESC"),
            card("safety-autohold.jpg", 450, "Тоормос автоматаар барих", "Гэрлэн дохион дээр тоормос дарахгүйгээр зогсож байна.", "AUTO HOLD-оор зогсож буй R5", "AUTO HOLD"),
            card("safety-tpms.jpg", 450, "Дугуйн даралтын хяналт", "Дугуй бүрийн даралтыг бодит цагт хянана.", "R5-ын дугуйн даралтын хяналт", "TPMS")
          ] }
      ] },
      { id: "interior", blocks: [
        { type: "feature", image: img("cockpit.jpg", 800, 533, "R5-ын кабин, төв дэлгэц"),
          tagline: "Кабин", title: "Ухаалаг кабин",
          // "Beyond II" is an R5 Pro trim name; R5's top trim is "Smart Supercharge Transcendence I" (10.1" on cargo).
          text: "8.8 инчийн LCD хянах самбар, олон үйлдэлт жолооны хүрд, түлхүүргүй асаалт. Дээд иж бүрдэлд төв дэлгэц, дуут удирдлага нэмэгдэнэ.",
          facts: [{ label: "Хянах самбар", value: "8.8\"" }, { label: "Төв дэлгэц", value: "10.1–15.6\"" }, { label: "Түдгэлзүүлэлт", value: "MacPherson" }] }
      ] },
      { id: "specs", tone: "surface", blocks: [{
        type: "specGroups", title: "R5-ын үзүүлэлт",
        image: { src: { cargo: "/assets/r5/cargo-34.jpg", passenger: "/assets/r5/pass-34.jpg" }, width: 800, height: 450, alt: { cargo: "R5 ачааны хувилбар", passenger: "R5 зорчигчийн хувилбар" } },
        groups: [
          { heading: "Хэмжээ", rows: [
            { label: "Урт × өргөн × өндөр", value: "5,170 × 1,860 × 2,020 мм" },
            { label: "Тэнхлэг хоорондын зай", value: "3,200 мм" },
            { label: "Урд / хойд дугуй хоорондын зай", value: "1,624 / 1,624 мм" },
            { label: { cargo: "Ачааны тасалгаа", passenger: "Суудал" }, value: { cargo: "3,025 × 1,750 × 1,455 мм · 7.7 м³", passenger: "6 (2+2+2) · 9 (2+2+2+3)" } }
          ] },
          { heading: "Хүч", rows: [
            { label: "Мотор", value: "Байнгын соронзон синхрон, урд" },
            { label: "Хүч / эргэх момент", value: { cargo: "70 кВт / 230 Н·м", passenger: "100 кВт / 240 Н·м" } },
            { label: "Хөтлөгч", value: "Урд дугуйгаар" },
            { label: "Дээд хурд", value: { cargo: "90 км/ц", passenger: "100 км/ц" } }
          ] },
          { heading: "Батерей ба цэнэглэлт", rows: [
            { label: "Зай", value: "58.24 кВт·ц LFP (Ganfeng), шингэн хөргөлт" },
            { label: "Туулах зай (CLTC)", value: { cargo: "401 км", passenger: "403 км" }, note: 1 },
            { label: "Хурдан цэнэглэлт 20–80%", value: "18 мин (2C)" },
            { label: "Удаан цэнэглэлт", value: "6.6 кВт · ойролцоогоор 8 цаг" }
          ] },
          { heading: "Явах эд анги", rows: CHASSIS() }
        ],
        // Pioneer I Supercharger has no standard rear camera, so it is not sold (dealer rule); two trims remain.
        compare: {
          title: "Иж бүрдлийн харьцуулалт", columns: ["Иж бүрдэл", "Pioneer I Smart Driving", "Beyond II Smart Driving"],
          rows: [
            { head: "Хянах самбар / дэлгэц", cells: [{ text: "8.8\" LCD" }, { text: "8.8\" LCD + 15.6\" төв дэлгэц" }] },
            { head: "Арын камер, TPMS, ESC, AUTO HOLD", cells: [{ text: "●" }, { text: "●" }] },
            { head: "Автомат гэрэл, HMA", cells: [{ text: "●" }, { text: "●" }] },
            { head: "ACC, ICA, AEB, FCW, LDW, LDP, ISA", cells: [{ text: "●" }, { text: "●" }] },
            { head: "Зогсоолын радар", cells: [{ text: "Хойд" }, { text: "Урд, хойд" }] },
            { head: "360° камер, DMS", cells: [{ text: "—" }, { text: "●" }] },
            { head: "Агаарын дэр", cells: [{ text: "—" }, { text: "Жолооч, зорчигч" }] },
            { head: "Утасгүй цэнэглэгч, дуут удирдлага", cells: [{ text: "—" }, { text: "●" }] },
            { head: "Чанга яригч", cells: [{ text: "2" }, { text: "4" }] },
            { head: "Суудлын материал", cells: [{ text: "Даавуу" }, { text: "Арьс + даавуу" }] },
            { head: "Түлхүүргүй асаалт, OTA, апп, V2L", cells: [{ text: "●" }, { text: "●" }] }
          ]
        }
      }] }
    ],
    end: {
      title: "R5-аа өнөөдөр туршаад үзээрэй",
      text: "Ойролцоох салбартаа туршилтын жолоодлого захиалж, зай болон тохиргооны сонголтоо тодруулаарай.",
      image: {
        src: { cargo: "/assets/r5/cargo-front.jpg", passenger: "/assets/r5/pass-front.jpg" }, width: 800, height: 450,
        alt: { cargo: "R5 ачааны фургон урдаас", passenger: "R5 зорчигчийн фургон урдаас" }
      },
      secondary: { label: "Бусад загвар үзэх", href: "/" }
    },
    notes: [
      "Туулах зай нь CLTC (Хятадын хөнгөн тээврийн туршилтын цикл, GB/T 18386.1-2021) стандартын туршилтын үр дүн бөгөөд батерейн багтаамжаас хамаарна. Бодит зай нь тохиргоо, батерейн насжилт, жолоодлогын зуршил, цаг агаар, замын нөхцөлөөс хамаарна.",
      "Жолоочийн туслах системүүд нь жолоочийг орлохгүй. Жолооч замын нөхцөлд үргэлж анхаарал хандуулж, машинаа бүрэн хянах ёстой. Мөс, цас, бороо, үзэгдэх орчин муу үед болгоомжтой яваарай.",
      "Үзүүлэлт, тохиргоо нь үйлдвэрлэгчийн мэдээлэлд үндэслэсэн лавлагаа бөгөөд урьдчилан мэдэгдэлгүйгээр өөрчлөгдөж болно. Монголд нийлүүлэгдэх тохиргоог салбараас тодруулна уу."
    ]
  }
};
