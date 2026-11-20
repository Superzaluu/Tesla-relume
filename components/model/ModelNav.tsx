"use client";
// 4.1 (user, 2026-11-20): in-page menu that sticks under the site navbar on every model page.
// ModelPage passes only the sections the model has; the link of the section in view is highlighted.
// B′ (user's Figma, 2026-11-20): a "Туршилтын жолоодлого" button on the right opens the Cal.com calendar.
import { useEffect, useState } from "react";
import { calTestDrive } from "@/components/ui/CalTestDrive";
import { LoadingLink } from "@/components/ui/LoadingLink";

/** `href`: a link to another page (e.g. «Ногоон зээл») instead of a section of this one. */
export type NavItem = { id: string; label: string; href?: string };

/**
 * `preorder`: "Урьдчилсан захиалга" right after «Ногоон зээл» (user, 2026-11-20), a green button in the sticky
 * menu so the order is one click away from anywhere on the page; it moved here from the hero.
 */
export function ModelNav({ items, preorder }: { items: NavItem[]; preorder?: string }) {
  const [current, setCurrent] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items.filter((item) => !item.href).map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;
    // A section counts as "in view" when it crosses a line just under the two sticky bars.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <nav className="mnav" aria-label="Хуудасны хэсгүүд">
      <div className="mnav__inner">
        <ul className="mnav__list">
          {items.map((item) => (
            <li key={item.id}>
              {item.href
                ? <a className="mnav__out" href={item.href}>{item.label}</a>
                : <a href={`#${item.id}`} aria-current={item.id === current ? "true" : undefined} onClick={() => setCurrent(item.id)}>{item.label}</a>}
            </li>
          ))}
          {preorder && (
            <li className="mnav__preorder">
              <LoadingLink className="btn btn--primary" href={preorder}>Урьдчилсан захиалга</LoadingLink>
            </li>
          )}
        </ul>
        <button type="button" className="btn btn--primary mnav__cta" {...calTestDrive}>Туршилтын жолоодлого</button>
      </div>
    </nav>
  );
}
