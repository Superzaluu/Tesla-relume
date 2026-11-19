import Link from "next/link";
import type { ReactNode } from "react";
import { SpecIcon } from "@/components/model/SpecIcon";
import { QuickIcon } from "@/components/ui/QuickSpecs";
import { calTestDrive } from "@/components/ui/CalTestDrive";

export type StripRange = { value: string; text: string; href: string };

const BENEFITS = [
  { icon: "shield", title: "6 жил / 300,000 км", text: "Батерейн баталгаа", href: "/warranty/" },
  { icon: "charging", title: "18 мин · 20–80%", text: "Хурдан цэнэглэлт", href: "#chargers" },
  { icon: "percent", title: "Ногоон зээл", text: "Урьдчилгаа 10%-аас", href: "/green-loan/" },
  { icon: "snow", title: "−30°C", text: "Хүйтэнд туршсан", href: "#gallery" }
];

// From 1280px all six sit in one row (~225px each), so padding, icon and text get a little smaller there.
// The action item (test drive) is a <button> that opens the Cal.com booking popup instead of a link.
function Item({ href, icon, title, text, action = false }: { href?: string; icon: ReactNode; title: string; text?: string; action?: boolean }) {
  const className = `flex h-full items-center gap-3 px-4 py-4 sm:px-5 xl:gap-2.5 xl:px-3.5 ${action ? "text-white hover:bg-[#083d28]" : "hover:bg-[#f6faf8]"}`;
  const body = (
    <>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-solid xl:h-10 xl:w-10 ${action ? "border-white/40 bg-white/10 text-white" : "border-[#bcd7c7] bg-white text-[#0f5a3a]"}`}>
          {icon}
        </span>
        <span className="min-w-0">
          <span className={`block text-[15px] font-bold leading-tight xl:text-[14px] ${action ? "text-white" : "text-ink"}`}>{title}</span>
          {text && <span className={`block truncate text-small xl:text-[13px] ${action ? "text-white/80" : "text-ink-muted"}`}>{text}</span>}
        </span>
    </>
  );
  return (
    <li className={action ? "bg-[#0f5a3a]" : "bg-white"}>
      {href ? (
        <Link href={href} className={className}>{body}</Link>
      ) : (
        <button type="button" {...calTestDrive} className={`${className} w-full cursor-pointer border-0 bg-transparent text-left font-[inherit]`}>{body}</button>
      )}
    </li>
  );
}

/**
 * White strip on the bottom edge of the hero (reference: EVdriveX feature strip), rendered by HeroCarousel.
 * Order (user, 2026-11-15): the current slide's range, the four promises, then the test-drive action that
 * used to be the navbar button, filled green as the one call to action. 1px gaps on a line-coloured list draw
 * the dividers for any column count: 2 columns on phones, 3 on tablets and small laptops, one row from 1280px.
 */
export function BenefitStrip({ range }: { range?: StripRange }) {
  return (
    <div className="tw benefit-strip relative z-[15] px-global">
      <ul className={`m-0 mx-auto grid max-w-[1376px] list-none grid-cols-2 gap-px overflow-hidden rounded-card border border-solid border-line bg-line p-0 shadow-[0_14px_36px_rgb(15_35_56/.12)] md:grid-cols-3 ${range ? "xl:grid-cols-6" : "xl:grid-cols-5"}`}>
        {range && (
          <Item href={range.href} icon={<QuickIcon icon="range" className="h-6 w-6" />} title={range.value} text={range.text} />
        )}
        {BENEFITS.map((item) => (
          <Item key={item.title} href={item.href} icon={<SpecIcon icon={item.icon} />} title={item.title} text={item.text} />
        ))}
        {/* Opens the Cal.com test-drive calendar (user, 2026-11-19); the homepage form stays as a fallback. */}
        <Item icon={<SpecIcon icon="steer" />} title="Туршилтын жолоодлого" action />
      </ul>
    </div>
  );
}
