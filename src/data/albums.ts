// «Гадна ба дотор орчин» photo album (user, 2026-11-20): up to 6 photos of THIS model, each with its caption on
// the photo, no photo twice. Sources: the model's own rc-ev.com page (gallery, «车型概览» posters), the EC75
// −30°C test video, and for the C5 family the C5 winter-test photos from its rc-ev poster (shown first, user:
// "C5-уудад өвлийн тестийг зураг түлхүү"). The first photo is the large tile, so it is always a sharp one.
// Captions never claim more than the spec sheet / catalog says; winter photos carry the «Өвлийн туршилт» tag.
// Models with too few own photos get fewer tiles; ED71S uses the C5's (same truck except leaf springs, user)
// and says so in the tag. C3 cold has no photos of its own (none on rc-ev.com), so it has no album.

export type AlbumItem = { src: string; width: number; height: number; title: string; text?: string; tag?: string };

const WINTER = "Өвлийн туршилт";
const at = (dir: string, file: string) => `/assets/models/${dir}/${file}`;

const c5Winter = (tag = WINTER): AlbumItem[] => [
  { src: at("c5", "album/winter-1.jpg"), width: 1750, height: 1050, tag, title: "Цастай хээрийн замд", text: "C5-ууд цас, мөстэй замаар цуваагаар туршигдав." },
  { src: at("c5", "album/winter-5.jpg"), width: 1750, height: 1050, tag, title: "Хүйтэнд бэлэн", text: "Батерейн дулааны удирдлага −30°C-аас 65°C хүртэл ажиллана." },
  { src: at("c5", "album/winter-2.jpg"), width: 1910, height: 1000, tag, title: "Цасан талбайд", text: "Цас, мөсөн гадаргуу дээрх туршилт." },
  { src: at("c5", "album/winter-3.jpg"), width: 2198, height: 1320, tag, title: "Ойн цастай зам", text: "Нар жаргах үеийн хүйтэнд ч туршилт үргэлжилнэ." },
  { src: at("c5", "album/winter-4.jpg"), width: 1750, height: 950, tag, title: "Мөстэй замд", text: "Хальтиргаатай замд тогтвортой явалт." }
];
const C5_FLATBED: AlbumItem = { src: at("c5", "album/flatbed.jpg"), width: 800, height: 450, title: "Нэг кабин, задгай тэвш", text: "Нэг эгнээ суудалтай кабин, урт тэвш." };
const C5_CREW: AlbumItem = { src: at("c5", "album/crew.jpg"), width: 800, height: 450, title: "Давхар кабин, задгай тэвш", text: "5 хүртэл хүн, ачаа нь нэг машинд." };
const C5_STEERING: AlbumItem = { src: at("c5", "album/steering.jpg"), width: 800, height: 450, title: "Цахилгаан жолоо", text: "C-EPS эсвэл R-EPS (иж бүрдлээс хамаарна): бага хүчээр нарийн удирдана." };

const c5Flatbed = [...c5Winter(), C5_FLATBED];
const c5Crew = [...c5Winter(), C5_CREW];
const c5Box = [...c5Winter(), C5_STEERING];

const ec75Frame = (file: string, title: string, text: string): AlbumItem =>
  ({ src: `/assets/ec75/album/${file}`, width: 967, height: 372, tag: WINTER, title, text });

export const ALBUMS: Record<string, AlbumItem[]> = {
  c5: c5Flatbed, "c5-cng": c5Flatbed, "c5-reev": c5Flatbed,
  "c5-cng-crew": c5Crew, "c5-reev-crew": c5Crew,
  "c5-box": c5Box, "c5-cng-box": c5Box, "c5-reev-box": c5Box, "c5-cng-crew-box": c5Box, "c5-reev-crew-box": c5Box,
  "c5-drone": [
    ...c5Winter().slice(0, 4),
    { src: at("c5-drone", "g2.jpg"), width: 600, height: 400, title: "Дроны тавцан", text: "Дроныг тэвш рүү шатаар өргөж ачна." },
    { src: at("c5-drone", "g3.jpg"), width: 600, height: 400, title: "Явуулын цэнэглэх станц", text: "Талбай дээрээ дроны батерейг цэнэглэнэ." }
  ],
  // Same truck as the C5 BEV except leaf springs front and rear: the C5's winter test, named as such.
  ed71s: c5Winter("C5-ын өвлийн туршилт"),

  ec75: [
    ec75Frame("winter-014.jpg", "Мөсөн нуур дээр", "Хятадын хойд хил, Хэйхэ хотын Удаляньчид хийсэн туршилт."),
    ec75Frame("winter-074.jpg", "Цасан замд", "Цас, мөстэй замаар туршилтын явалт."),
    ec75Frame("winter-050.jpg", "Мөсөн дээрх эргэлт", "Хальтиргаатай гадаргуу дээр тогтвортой."),
    ec75Frame("winter-056.jpg", "Хүйтэнд цэнэглэх", "Хүйтэн дэх цэнэглэлтийн туршилт."),
    ec75Frame("winter-080.jpg", "Ойн замд", "Цастай ойн замаар явалт."),
    ec75Frame("winter-098.jpg", "Нар жаргахад", "Хүйтэн оройн туршилт.")
  ],
  "ec75pro-cargo": [
    { src: at("ec75pro-cargo", "album/van.jpg"), width: 517, height: 530, title: "130 кВт мотор", text: "Ачаатай ч хурдан хөдөлнө." },
    { src: at("ec75pro-cargo", "album/driver.jpg"), width: 674, height: 375, title: "Жолоочийн байр", text: "Хүрд, дэлгэц гарын дор." },
    { src: at("ec75pro-cargo", "story/cargo-clean.jpg"), width: 395, height: 228, title: "Ачааны тасалгаа", text: "7.7 м³ ачааны тасалгаа." },
    { src: at("ec75pro-cargo", "story/battery-clean.jpg"), width: 405, height: 228, title: "Хол замд", text: "61.94 кВт·ц батерей, 420 км." },
    { src: at("ec75pro-cargo", "story/chassis-clean.jpg"), width: 395, height: 228, title: "Ухаалаг шасси", text: "Батерей шалан доор, жин нь доогуур." },
    { src: at("ec75pro-cargo", "story/interior-screen-clean.jpg"), width: 288, height: 173, title: "Төв дэлгэц", text: "Навигаци, дуу, тохиргоо нэг дор." }
  ],
  "ec75pro-passenger": [
    { src: at("ec75pro-passenger", "album/road.jpg"), width: 661, height: 355, title: "Зорчигчийн хувилбар", text: "6 эсвэл 9 суудал." },
    { src: at("ec75pro-passenger", "album/driver.jpg"), width: 674, height: 375, title: "Жолоочийн байр", text: "Хүрд, дэлгэц гарын дор." },
    { src: at("ec75pro-passenger", "album/front.jpg"), width: 384, height: 300, title: "Саарал өнгө", text: "Шинэчлэгдсэн гадна төрх." },
    { src: at("ec75pro-passenger", "story/battery.jpg"), width: 527, height: 316, title: "Хол замд", text: "61.94 кВт·ц батерей, 430 км." },
    { src: at("ec75pro-passenger", "story/chassis.jpg"), width: 608, height: 365, title: "Ухаалаг шасси", text: "Батерей шалан доор, жин нь доогуур." },
    { src: at("ec75pro-passenger", "story/interior-screen.jpg"), width: 483, height: 290, title: "Төв дэлгэц", text: "Навигаци, дуу, тохиргоо нэг дор." }
  ],
  r5: [
    { src: "/assets/r5/album/cabin.jpg", width: 800, height: 533, title: "Кабин", text: "Өргөн самбар, том дэлгэц." },
    { src: "/assets/r5/album/parking.jpg", width: 800, height: 450, title: "Зогсоолд", text: "Камерын дүрсээр давчуу газар зогсооно." },
    { src: "/assets/r5/album/night.jpg", width: 800, height: 450, title: "Шөнийн замд", text: "Туслах системүүд шөнө ч ажиллана." },
    // R5 Pro is a power choice on this page (src/data/pro.ts): its own photos, tagged as R5 Pro.
    { src: at("r5pro-cargo", "album/van.jpg"), width: 517, height: 530, tag: "R5 Pro", title: "R5 Pro", text: "61.94 кВт·ц батерей, 130 кВт мотор, 420–430 км." },
    { src: at("r5pro-cargo", "album/shifter.jpg"), width: 674, height: 375, tag: "R5 Pro", title: "Хурдны хөшүүрэг", text: "Суудлын машин шиг хялбар." },
    { src: at("r5pro-cargo", "story/chassis.jpg"), width: 640, height: 384, tag: "R5 Pro", title: "Ухаалаг шасси", text: "Батерей шалан доор, жин нь доогуур." }
  ],
  "r5pro-cargo": [
    { src: at("r5pro-cargo", "story/cargo.jpg"), width: 673, height: 404, title: "Ачааны тасалгаа", text: "7.7 м³, хажуу хаалгаар ачна." },
    { src: at("r5pro-cargo", "album/van.jpg"), width: 517, height: 530, title: "130 кВт мотор", text: "Ачаатай ч хурдан хөдөлнө." },
    { src: at("r5pro-cargo", "album/shifter.jpg"), width: 674, height: 375, title: "Хурдны хөшүүрэг", text: "Суудлын машин шиг хялбар." },
    { src: at("r5pro-cargo", "story/battery.jpg"), width: 858, height: 514, title: "Хол замд", text: "61.94 кВт·ц батерей, 420 км." },
    { src: at("r5pro-cargo", "story/chassis.jpg"), width: 640, height: 384, title: "Ухаалаг шасси", text: "Батерей шалан доор, жин нь доогуур." },
    { src: at("r5pro-cargo", "story/interior-screen.jpg"), width: 496, height: 298, title: "Төв дэлгэц", text: "Навигаци, дуу, тохиргоо нэг дор." }
  ],
  "r5pro-passenger": [
    { src: at("r5pro-passenger", "story/battery.jpg"), width: 519, height: 312, title: "Зорчигчийн хувилбар", text: "6 эсвэл 9 суудал, 61.94 кВт·ц батерей." },
    { src: at("r5pro-passenger", "album/shifter.jpg"), width: 674, height: 375, title: "Хурдны хөшүүрэг", text: "Суудлын машин шиг хялбар." },
    { src: at("r5pro-passenger", "story/chassis.jpg"), width: 640, height: 384, title: "Ухаалаг шасси", text: "Батерей шалан доор, жин нь доогуур." },
    { src: at("r5pro-passenger", "story/interior-screen.jpg"), width: 496, height: 298, title: "Төв дэлгэц", text: "Навигаци, дуу, тохиргоо нэг дор." }
  ],
  "r5-service": [
    { src: at("r5-service", "g1.jpg"), width: 800, height: 533, title: "Явуулын засвар", text: "Багаж, тоног төхөөрөмжөө ачаад үйлчлүүлэгч дээр очно." },
    { src: at("r5-service", "g3.jpg"), width: 800, height: 533, title: "Засварын тасалгаа", text: "Дугуй солих машин, багажны шүүгээ." },
    { src: at("r5-service", "g2.jpg"), width: 800, height: 533, title: "Арын хаалга", text: "Тавиур, шүүгээ ар талаас нээгдэнэ." },
    { src: at("r5-service", "g4.jpg"), width: 800, height: 533, title: "Зүүн тал", text: "Хажуу хаалгаар багаждаа шууд хүрнэ." },
    { src: at("r5-service", "g5.jpg"), width: 800, height: 533, title: "Баруун тал", text: "Тусгай зориулалтын бүрэн тоноглол." }
  ],

  c3: [
    { src: at("c3", "g1.jpg"), width: 800, height: 480, title: "Хотын хүргэлтэд", text: "Авсаархан кабин, задгай тэвш." },
    { src: at("c3", "album/side.jpg"), width: 1620, height: 720, title: "3.3 м тэвш", text: "Урт тэвшэнд нэг удаад их ачаа." },
    { src: at("c3", "album/front.jpg"), width: 1620, height: 870, title: "Урт хамар", text: "Урд талын бүтэц мөргөлдөлтийн энергийг шингээнэ." },
    { src: at("c3", "g3.jpg"), width: 800, height: 450, title: "Тэгш шалтай кабин", text: "Үргэлжилсэн суудал, өргөн зай." },
    { src: at("c3", "g2.jpg"), width: 800, height: 450, title: "Хоёр дэлгэц", text: "15.6 инч төв дэлгэц, 8.8 инч хянах самбар." },
    { src: at("c3", "album/shifter.jpg"), width: 725, height: 405, title: "Хурдны хөшүүрэг", text: "Суудлын машин шиг хялбар удирдлага." }
  ],
  c5l: [
    { src: at("c5l", "album/truck.jpg"), width: 1530, height: 1040, title: "Хайрцагтай C5L", text: "Хотын түгээлтэд зориулсан урт хайрцаг." },
    { src: at("c5l", "album/side.jpg"), width: 1400, height: 840, title: "Хажуугийн 4 хаалга", text: "Хайрцгийг хажуу талаас нь ч ачиж буулгана." },
    { src: at("c5l", "album/motor.jpg"), width: 1392, height: 815, title: "110 кВт мотор", text: "Ачаатай ч өгсүүрт хүчтэй." },
    { src: at("c5l", "story/cargo.jpg"), width: 1350, height: 810, title: "3802 мм хайрцаг", text: "Хаалгууд бүрэн нээгдэж ачихад хялбар." },
    { src: at("c5l", "story/chassis.jpg"), width: 1380, height: 820, title: "Даацтай рам", text: "Хүнд ачаанд зориулсан бат бөх бүтэц." },
    { src: at("c5l", "story/battery.jpg"), width: 1380, height: 824, title: "Хол замд", text: "70.92 кВт·ц батерей, 415 км." }
  ],
  c9: [
    { src: at("c9", "story/cabin.jpg"), width: 1160, height: 695, title: "Унтаж амрах кабин", text: "Өргөн кабинд хэвтэж амарна." },
    { src: at("c9", "album/heat-pump.jpg"), width: 1502, height: 688, title: "Дулааны насос", text: "Өвөл кабин, батерейг хэмнэлттэй халаана." },
    { src: at("c9", "story/cargo.jpg"), width: 1260, height: 690, title: "4.3 м хайрцаг", text: "Урт хайрцаг, их ачаа." },
    { src: at("c9", "story/chassis.jpg"), width: 1260, height: 690, title: "Рам", text: "Батерей рамын дунд хамгаалагдсан." },
    { src: at("c9", "story/brakes.jpg"), width: 1260, height: 690, title: "Тоормос", text: "Ачаатай ч богино зайд зогсоно." },
    { src: at("c9", "story/interior-screen.jpg"), width: 940, height: 690, title: "Хоёр дэлгэц", text: "Навигаци, дуу, тохиргоо нэг дор." }
  ],
  ec31: [
    { src: at("ec31", "album/rear-open.jpg"), width: 880, height: 660, title: "Арын хаалга", text: "Хоёр тал руугаа бүрэн нээгдэнэ." },
    { src: at("ec31", "g1.jpg"), width: 400, height: 300, title: "Хайрцагтай", text: "6.7–6.9 м³ хайрцаг." },
    { src: at("ec31", "story/cargo.jpg"), width: 895, height: 610, title: "Хажуугийн хаалга", text: "Хажуугаас нь ч ачна." },
    { src: at("ec31", "g6.jpg"), width: 400, height: 300, title: "Жолоочийн суудал", text: "Өргөн харагдацтай кабин." },
    { src: at("ec31", "g4.jpg"), width: 400, height: 300, title: "Араа сонгогч", text: "Эргүүлдэг бариулаар араа солино." },
    { src: at("ec31", "g5.jpg"), width: 400, height: 300, title: "Хаалганы самбар", text: "Цонхны цахилгаан товч, сав." }
  ],
  ec31l: [
    { src: at("ec31l", "album/flatbed.jpg"), width: 790, height: 620, title: "Урт тэвш", text: "3,050 мм тэвш, 1.2 тонн хүртэл даац." },
    { src: at("ec31l", "g3.jpg"), width: 400, height: 300, title: "Кабин", text: "Өргөн харагдацтай жолоочийн байр." },
    // EC31 family cab (the EC31L's own rc-ev poster shows the same cab parts); its own exterior photos are near-identical.
    { src: at("ec31", "g4.jpg"), width: 400, height: 300, title: "Араа сонгогч", text: "Эргүүлдэг бариулаар араа солино." },
    { src: at("ec31", "g5.jpg"), width: 400, height: 300, title: "Хаалганы самбар", text: "Цонхны цахилгаан товч, сав." }
  ],
  ec31s: [
    { src: at("ec31s", "story/cargo.jpg"), width: 1420, height: 850, title: "7.9 м³ хайрцаг", text: "Их овортой ачаанд." },
    { src: at("ec31s", "g1.jpg"), width: 400, height: 300, title: "Хажуугаас", text: "Урт хайрцаг, богино кабин." },
    { src: at("ec31s", "g2.jpg"), width: 400, height: 300, title: "Урдаас", text: "Авсаархан, хотын гудамжинд багтана." },
    { src: at("ec31s", "g3.jpg"), width: 400, height: 300, title: "Баруун тал", text: "Хайрцаг кабинаас өндөр." },
    { src: at("ec31s", "g5.jpg"), width: 400, height: 300, title: "Араа сонгогч", text: "Эргүүлдэг бариулаар араа солино." },
    { src: at("ec31s", "g6.jpg"), width: 400, height: 300, title: "Хаалганы самбар", text: "Цонхны цахилгаан товч, сав." }
  ],
  ec35: [
    { src: at("ec35", "story/cargo.jpg"), width: 910, height: 540, title: "Арын хаалга", text: "Өргөгддөг хаалга, тэгш шал." },
    { src: at("ec35", "g1.jpg"), width: 400, height: 300, title: "Ачааны фургон", text: "2 эсвэл 5 суудалтай." },
    { src: at("ec35", "g2.jpg"), width: 400, height: 300, title: "Хажуугаас", text: "4.5 м урт, хотод эвтэйхэн." },
    { src: at("ec35", "g3.jpg"), width: 400, height: 300, title: "Урдаас", text: "Өргөн салхины шил, сайн харагдац." },
    { src: at("ec35", "g5.jpg"), width: 400, height: 300, title: "Ар тал", text: "Өргөн нээгдэх арын хаалга." },
    { src: at("ec35", "g6.jpg"), width: 400, height: 300, title: "Кабин", text: "Жолоочийн байр, самбар." }
  ]
};

export const albumOf = (slug: string): AlbumItem[] => ALBUMS[slug] ?? [];
