import { SectionTitle } from "@/components/ui/SectionTitle";
import { SpecIcon } from "@/components/model/SpecIcon";
import type { SheetView } from "@/data/specSheet";

// 4.4 (user, 2026-11-20): "Өвлийн нөхцөлд" — battery heating from the spec sheet, the PTC cabin heater when
// the sheet names one, and a plain note that cold weather shortens the range. No invented percentages.

const HEATING: Record<SheetView["winter"]["heating"], string> = {
  yes: "Бүх иж бүрдэлд стандартаар",
  some: "Зарим иж бүрдэлд",
  option: "Нэмэлт сонголтоор",
  none: "Байхгүй",
  unknown: "—"
};

export function WinterSection({ winter }: { winter: SheetView["winter"] }) {
  return (
    <section className="section" id="winter">
      <div className="container mwinter">
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
    </section>
  );
}
