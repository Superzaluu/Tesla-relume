import Image from "next/image";
import Link from "next/link";
import { navigation } from "@/data/navigation";

const about = [
  { label: "Танилцуулга", href: "#" },
  { label: "Шинэ мэдээ", href: "#" },
  { label: "Хүсэлт илгээх", href: "/register/" },
  { label: "Нууцын бодлого", href: "#" }
];

const social = [
  { label: "Facebook", href: "#", icon: <path fill="currentColor" d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" /> },
  { label: "Instagram", href: "#", icon: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" /></> },
  { label: "YouTube", href: "#", icon: <path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /> }
];

const heading = "mb-4 text-sm font-semibold text-white";

export function SiteFooter() {
  return <footer className="bg-slate-950 text-slate-300">
    <div className="border-b border-slate-800 bg-brand-dark">
      <div className="page-shell flex flex-wrap items-center justify-between gap-5 py-8">
        <div><h2 className="text-xl font-bold text-white">Бүртгэл үүсгэж мэдээлэл авах</h2><p className="mt-1 text-sm text-white/70">Шинэ загвар, урамшуулал, Ногоон зээлийн мэдээллийг хамгийн түрүүнд аваарай.</p></div>
        <Link href="/register/" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand hover:bg-brand-mist">Бүртгэл үүсгэх</Link>
      </div>
    </div>

    <div className="page-shell grid gap-12 py-14 lg:grid-cols-[2.4fr_1fr]">
      <nav aria-label="Загварууд">
        <Link href="/" aria-label="Нүүр хуудас"><Image src="/assets/brand-logo-transparent.png" alt="Ruichi" width={57} height={36} className="brightness-0 invert" /></Link>
        <h2 className="mb-6 mt-8 text-base font-semibold text-white">Загварууд</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {navigation.map((group) => <div key={group.label}>
            <h3 className={heading}>{group.label}</h3>
            <ul className="space-y-3 text-sm">
              {group.items.map((item) => <li key={`${group.label}-${item.slug}`}><Link className="group block" href={item.href}><span className="block font-medium text-slate-200 group-hover:text-white">{item.name}</span><span className="block text-xs text-slate-500 group-hover:text-slate-400">{item.desc}</span></Link></li>)}
            </ul>
          </div>)}
        </div>
      </nav>

      <div className="grid content-start gap-10 sm:grid-cols-3 lg:grid-cols-1">
        <div>
          <h2 className={heading}>Бидний тухай</h2>
          <ul className="space-y-2 text-sm">{about.map((item) => <li key={item.label}><Link className="hover:text-white" href={item.href}>{item.label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className={heading}>Холбоо барих</h2>
          <p className="text-sm"><span className="block text-xs text-slate-500">Хаяг</span>Улаанбаатар хот</p>
          <a className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-slate-400 hover:text-white" href="https://www.google.com/maps/search/?api=1&query=Ulaanbaatar" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            Байршил
          </a>
        </div>
        <div>
          <h2 className={heading}>Биднийг дагах</h2>
          <ul className="flex gap-2">{social.map((item) => <li key={item.label}><a href={item.href} aria-label={item.label} className="grid h-10 w-10 place-items-center rounded-full border border-slate-700 hover:border-slate-400 hover:text-white"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg></a></li>)}</ul>
        </div>
      </div>
    </div>

    <div className="border-t border-slate-800">
      <div className="page-shell flex flex-wrap justify-between gap-3 py-5 text-xs text-slate-500">
        <span>© 2025. Бүх эрх хуулиар хамгаалагдсан.</span>
        <ul className="flex flex-wrap gap-4"><li><a className="hover:text-white" href="#">Нууцлалын бодлого</a></li><li><a className="hover:text-white" href="#">Үйлчилгээний нөхцөл</a></li><li><a className="hover:text-white" href="#">Күүки тохиргоо</a></li></ul>
      </div>
    </div>
  </footer>;
}
