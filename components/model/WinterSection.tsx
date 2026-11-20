import { SectionTitle } from "@/components/ui/SectionTitle";
import { SpecIcon } from "@/components/model/SpecIcon";
import { VideoPoster } from "@/components/ui/VideoPoster";
import type { SheetView } from "@/data/specSheet";

// 4.4 (user, 2026-11-20): "Өвлийн нөхцөлд" — battery heating from the spec sheet, the PTC cabin heater when
// the sheet names one, and a plain note that cold weather shortens the range. No invented percentages.
// Beside it the EC75 −30°C cold test video (user, 2026-11-20: the empty right half). It is EC75's own test,
// so the caption says so on every other model's page.

const HEATING: Record<SheetView["winter"]["heating"], string> = {
  yes: "Бүх иж бүрдэлд стандартаар",
  some: "Зарим иж бүрдэлд",
  option: "Нэмэлт сонголтоор",
  none: "Байхгүй",
  unknown: "—"
};

/** `nested`: inside the «Хүч ба цэнэглэлт» chapter box (ChapterView) instead of a band of its own. */
export function WinterSection({ winter, nested = false }: { winter: SheetView["winter"]; nested?: boolean }) {
  const body = (
      <div className={nested ? "mwinter" : "container mwinter"}>
        <div className="mwinter__text">
          <SectionTitle tagline="Өвөлд бэлэн" title="Өвлийн нөхцөлд" text="Монголын хүйтэнд ажиллах машинд анхаарах гол зүйлс." />
          {(winter.heating !== "unknown" || winter.ptc) && <ul className="mkey__list mwinter__list">
            {/* Not entered in the sheet yet → the line is left out rather than showing a dash. */}
            {winter.heating !== "unknown" && (
              <li>
                <SpecIcon icon="battery" />
                <span className="mkey__text">
                  <span className="mkey__label">Батерей халаагч</span>
                  <strong>{HEATING[winter.heating]}</strong>
                </span>
              </li>
            )}
            {winter.ptc && (
              <li>
                <SpecIcon icon="snow" />
                <span className="mkey__text">
                  <span className="mkey__label">Бүхээгийн халаагуур</span>
                  <strong>PTC цахилгаан халаагуур</strong>
                </span>
              </li>
            )}
          </ul>}
          <p className="mwinter__note">
            Хүйтэнд батерейн ашиглагдах багтаамж түр буурдаг тул −30°C орчимд туулах зай стандарт туршилтын (CLTC) үр дүнгээс
            мэдэгдэхүйц богино байж болно. Бүхээг халаахад ч батерейн цэнэг зарцуулагдана. Өдөр тутмын маршрутаа төлөвлөхдөө үүнийг
            тооцоолж, боломжтой бол машинаа дулаан газар цэнэглээрэй.
          </p>
        </div>
        <figure className="mwinter__media">
          <VideoPoster className="mvideo" src="/assets/EC75_cold_test_MN_sub_v5.mp4" label="EC75 −30°C хүйтний туршилтын видео тоглуулах">
            <img className="mvideo__poster" src="/assets/ec75-cold-poster.jpg" width={960} height={408} alt="" loading="lazy" />
            <img className="mvideo__play" src="/assets/play-button.svg" width={64} height={64} alt="" />
          </VideoPoster>
          <figcaption>EC75-ыг −30°C хүйтэнд, цас мөстэй замд туршсан бичлэг.</figcaption>
        </figure>
      </div>
  );
  return nested
    ? <div className="mchapter__part" id="winter">{body}</div>
    : <section className="section" id="winter">{body}</section>;
}
