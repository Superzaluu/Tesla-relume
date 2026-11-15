import Link from "next/link";
import type { NavCategory } from "@/data/navigation";

// Footer, variant B (user, 2026-11-15): a test-drive call to action on top (the button left the navbar, so
// every page ends with a way to it), then four columns. Every model used to be listed here with its
// description (~1,000px); the models are in the navbar menus, so the footer links the six categories to the
// filtered homepage list instead (~420px).
// TODO: real phone number, opening hours, street address and social URLs (the icons still point to "#").

const services = [
  { label: "Ногоон зээл", href: "/green-loan/" },
  { label: "Батерейн баталгаа", href: "/warranty/" },
  { label: "Туршилтын жолоодлого", href: "/#test-drive" },
  { label: "Урьдчилсан захиалга", href: "/preorder/" }
];

const legal = [
  { label: "Нууцлалын бодлого", href: "/legal/privacy/" },
  { label: "Үйлчилгээний нөхцөл", href: "/legal/terms/" },
  { label: "Күүки тохиргоо", href: "/legal/cookies/" }
];

const heading = "m-0 mb-3 text-xs font-bold uppercase tracking-[.08em] text-white";
const list = "m-0 grid list-none gap-2 p-0 text-small text-[#cfe2d8]";
const link = "text-[#cfe2d8] no-underline hover:text-white hover:underline";

export function SiteFooter({ navigation }: { navigation: NavCategory[] }) {
  return (
    <footer className="tw bg-[#083d28] text-[#dfeee6]">
      <div className="bg-[#0f5a3a] px-global">
        <div className="mx-auto flex max-w-[1376px] flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="m-0 text-[20px] font-bold tracking-tight text-white">Машинаа өөрөө туршаад үзээрэй</p>
            <p className="m-0 text-small text-[#cfe7da]">Туршилтын жолоодлогод бүртгүүлэхэд хэдхэн минут</p>
          </div>
          <Link className="btn min-h-[44px] border-white bg-white px-6 text-[#0f5a3a] hover:bg-[#d9f7e5]" href="/#test-drive">Туршилтын жолоодлого</Link>
        </div>
      </div>

      <div className="px-global">
        <div className="mx-auto grid max-w-[1376px] gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="Нүүр хуудас" className="mb-3 inline-block">
              <img src="/assets/brand-logo-transparent.png" width={57} height={36} alt="" className="block brightness-0 invert" />
            </Link>
            <p className="m-0 mb-4 max-w-[34ch] text-small text-[#cfe2d8]">Цахилгаан ачааны болон зорчигчийн машин. −30°C-т туршсан, 6 жил / 300,000 км батерейн баталгаатай.</p>
            <ul className="m-0 flex list-none gap-2 p-0" aria-label="Биднийг дагах">
              {[
                { label: "Facebook", path: <path fill="currentColor" d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" /> },
                { label: "Instagram", path: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" /></> },
                { label: "YouTube", path: <path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /> }
              ].map((social) => (
                <li key={social.label}>
                  <a href="#" aria-label={social.label} target="_blank" rel="noopener" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white hover:text-[#0f5a3a]">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">{social.path}</svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Загварууд">
            <h2 className={heading}>Загварууд</h2>
            <ul className={list}>
              {navigation.map((category) => (
                <li key={category.id}><Link className={link} href={`/?category=${category.id}#models`}>{category.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Үйлчилгээ">
            <h2 className={heading}>Үйлчилгээ</h2>
            <ul className={list}>
              {services.map((item) => <li key={item.label}><Link className={link} href={item.href}>{item.label}</Link></li>)}
            </ul>
          </nav>

          <div>
            <h2 className={heading}>Холбоо барих</h2>
            <ul className={list}>
              <li>Улаанбаатар хот</li>
              <li>
                <a className={`${link} inline-flex items-center gap-1.5`} href="https://www.google.com/maps/search/?api=1&query=Ulaanbaatar" target="_blank" rel="noopener">
                  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                  Байршил
                </a>
              </li>
              <li><Link className={link} href="/#test-drive">Хүсэлт илгээх</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-0 border-t border-solid border-white/15 px-global">
        <div className="mx-auto flex max-w-[1376px] flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 text-small text-[#a9c7b8]">
          <p className="m-0">© {new Date().getFullYear()}. Бүх эрх хуулиар хамгаалагдсан.</p>
          <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
            {legal.map((item) => <li key={item.label}><Link className="text-[#a9c7b8] no-underline hover:text-white" href={item.href}>{item.label}</Link></li>)}
          </ul>
        </div>
      </div>
    </footer>
  );
}
