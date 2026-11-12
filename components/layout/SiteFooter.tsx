import Link from "next/link";
import type { NavCategory } from "@/data/navigation";

// TODO: Албан ёсны сошиал болон "Бидний тухай" хуудсуудын URL-ийг оруулах.
const about = [
  { label: "Танилцуулга", href: "#" },
  { label: "Шинэ мэдээ", href: "#" },
  { label: "Хүсэлт илгээх", href: "#" },
  { label: "Нууцын бодлого", href: "#" }
];

const legal = [
  { label: "Нууцлалын бодлого", href: "https://www.tesla.com/legal/privacy" },
  { label: "Үйлчилгээний нөхцөл", href: "https://www.tesla.com/legal/terms" },
  { label: "Күүки тохиргоо", href: "https://www.tesla.com/legal#cookie-preferences" }
];

export function SiteFooter({ navigation }: { navigation: NavCategory[] }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <nav className="site-footer__models" aria-label="Загварууд">
          <Link className="site-footer__logo" href="/" aria-label="Нүүр хуудас">
            <img src="/assets/brand-logo-transparent.png" width={57} height={36} alt="" />
          </Link>
          <h2 className="site-footer__heading">Загварууд</h2>
          <div className="site-footer__groups">
            {navigation.map((category) => (
              <div className="site-footer__group" key={category.id}>
                <h3>{category.label}</h3>
                <ul>
                  {category.items.map((item) => (
                    <li key={item.key}>
                      <Link href={item.href}>
                        <span className="site-footer__model">{item.name}</span>{" "}
                        <span className="site-footer__desc">{item.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="site-footer__about">
          <div className="site-footer__block">
            <h2 className="site-footer__heading">Бидний тухай</h2>
            <ul>
              {about.map((item) => <li key={item.label}><a href={item.href}>{item.label}</a></li>)}
            </ul>
          </div>

          <div className="site-footer__block">
            <h2 className="site-footer__heading">Холбоо барих</h2>
            <div className="site-footer__address">
              <p><span>Хаяг</span>Улаанбаатар хот</p>
              <a className="site-footer__location" href="https://www.google.com/maps/search/?api=1&query=Ulaanbaatar" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                Байршил
              </a>
            </div>
          </div>

          <div className="site-footer__block">
            <h2 className="site-footer__heading">Биднийг дагах</h2>
            <ul className="site-footer__social">
              <li><a href="#" aria-label="Facebook" target="_blank" rel="noopener">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" /></svg>
              </a></li>
              <li><a href="#" aria-label="Instagram" target="_blank" rel="noopener">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" /></svg>
              </a></li>
              <li><a href="#" aria-label="YouTube" target="_blank" rel="noopener">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /></svg>
              </a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {new Date().getFullYear()}. Бүх эрх хуулиар хамгаалагдсан.</p>
        <ul>
          {legal.map((item) => <li key={item.label}><a href={item.href} target="_blank" rel="noopener">{item.label}</a></li>)}
        </ul>
      </div>
    </footer>
  );
}
