"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavCategory } from "@/data/navigation";
import { useSiteChrome } from "@/components/layout/SiteChrome";

// Pages with a dark full-bleed photo under the navbar keep it transparent with
// white text; template model pages start on a light background; form pages
// get a solid bar from the start.
function baseClass(pathname: string) {
  if (pathname === "/") return "navbar";
  if (/^\/models\/(ec75|r5)\/?$/.test(pathname)) return "navbar";
  if (pathname.startsWith("/models/")) return "navbar is-on-light";
  return "navbar is-solid";
}

const Chevron = () => (
  <svg className="navmenu__chevron" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function SiteHeader({ navigation }: { navigation: NavCategory[] }) {
  const pathname = usePathname();
  const { heroLight } = useSiteChrome();
  const headerRef = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeAll = useCallback(() => { setOpenMenu(null); setMobileOpen(false); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything after navigating to another page.
  useEffect(() => { closeAll(); }, [pathname, closeAll]);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      triggers.current[openMenu]?.focus();
      setOpenMenu(null);
    };
    const onClick = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, [openMenu]);

  const hoverEnabled = () => window.matchMedia("(min-width: 1200px) and (hover: hover)").matches;
  const onEnter = (id: string) => {
    if (!hoverEnabled()) return;
    clearTimeout(hoverTimer.current);
    setOpenMenu(id);
  };
  const onLeave = () => {
    if (!hoverEnabled()) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };

  const base = baseClass(pathname);
  const classes = [
    base,
    pathname === "/" && heroLight ? "is-on-light" : "",
    scrolled || mobileOpen || openMenu ? "is-solid" : ""
  ].filter(Boolean).join(" ");

  return (
    <header className={classes} data-navbar ref={headerRef}>
      <div className="navbar__container">
        <Link className="navbar__logo logo" href="/" aria-label="Нүүр хуудас">
          <img src="/assets/brand-logo-transparent.png" width={57} height={36} alt="Ruichi" />
        </Link>

        <nav className={`navbar__links${mobileOpen ? " is-open" : ""}`} id="nav-links" aria-label="Загварууд">
          {navigation.map((category) => {
            const open = openMenu === category.id;
            return (
              <div className={`navmenu${open ? " is-open" : ""}`} key={category.id} onMouseEnter={() => onEnter(category.id)} onMouseLeave={onLeave}>
                <button
                  className="navmenu__trigger" type="button" aria-expanded={open} aria-controls={`menu-${category.id}`}
                  ref={(node) => { triggers.current[category.id] = node; }}
                  onClick={() => setOpenMenu(open ? null : category.id)}
                >
                  {category.label}<Chevron />
                </button>
                <div className="navmenu__panel" id={`menu-${category.id}`}>
                  <ul className="navmenu__grid">
                    {category.items.map((item) => (
                      <li key={item.key}>
                        <Link className="navmenu__card" href={item.href} onClick={closeAll}>
                          <img src={item.thumb} width={400} height={240} alt="" loading="lazy" />
                          <span className="navmenu__name">{item.name}</span>
                          <span className="navmenu__desc">{item.desc}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="navbar__actions">
          <a className="btn btn--primary btn--nav" href="#test-drive" aria-label="Туршилтын жолоодлого">
            <span className="btn__label-long">Туршилтын жолоодлого</span>
            <span className="btn__label-short">Турших</span>
          </a>
          <button
            className="navbar__toggle" type="button" aria-controls="nav-links" aria-expanded={mobileOpen}
            onClick={() => { setMobileOpen((value) => !value); if (mobileOpen) setOpenMenu(null); }}
          >
            {mobileOpen ? "Хаах" : "Цэс"}
          </button>
        </div>
      </div>
    </header>
  );
}
