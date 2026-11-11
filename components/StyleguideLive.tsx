"use client";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

// Styleguide helpers that read the values the browser actually applies, so the
// page stays correct when site.css changes (several :root blocks override each other).

/** Current value of a CSS custom property on :root. */
export function TokenValue({ name }: { name: string }) {
  const [value, setValue] = useState("…");
  useEffect(() => {
    const read = () => setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "—");
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [name]);
  return <code className="font-mono text-xs text-ink-muted">{value}</code>;
}

/** Renders a text sample and prints its computed font size / weight / line height. */
export function TypeSample({ as: Tag = "p", className, children }: { as?: ElementType; className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [spec, setSpec] = useState("");
  useEffect(() => {
    const read = () => {
      if (!ref.current) return;
      const s = getComputedStyle(ref.current);
      setSpec(`${s.fontSize} · ${s.fontWeight} · lh ${s.lineHeight} · ls ${s.letterSpacing}`);
    };
    read();
    document.fonts?.ready.then(read);
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return (
    <div className="grid gap-2 border-b border-line py-5 md:grid-cols-[220px_1fr] md:items-baseline">
      <div>
        <code className="font-mono text-xs text-primary">.{className.split(" ").join(" .")}</code>
        <p className="mt-1 font-mono text-[11px] text-ink-muted">{spec}</p>
      </div>
      <Tag ref={ref} className={className}>{children}</Tag>
    </div>
  );
}

/** Sticky numbered table of contents that highlights the section in view. */
export function StyleguideNav({ items }: { items: { id: string; num: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    items.forEach((item) => { const el = document.getElementById(item.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [items]);
  return (
    <nav aria-label="Styleguide агуулга" className="lg:sticky lg:top-[calc(var(--navbar-height)+24px)]">
      <ol className="m-0 grid list-none grid-cols-2 gap-1 p-0 sm:grid-cols-3 lg:grid-cols-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`flex gap-3 rounded-lg px-3 py-2 text-small transition-colors ${active === item.id ? "bg-[#eef5f3] font-semibold text-[#0f5a3a]" : "text-ink-secondary hover:bg-white"}`}
            >
              <span className="font-mono text-xs leading-5 opacity-60">{item.num}</span>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
