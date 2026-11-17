"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/** How long the loading state runs before the page changes (user request, 2026-11-17). */
const LOADING_MS = 2000;

/**
 * Order button with a seamless loading state: on click the button keeps its size, the label slides up
 * and out while a spinner with "Уншиж байна…" slides in from below, and a light fill runs across the
 * button for two seconds; then the order page opens. The target is prefetched on click, so it appears
 * at once when the fill ends. Ctrl/Cmd/Shift/middle clicks keep the browser's own behaviour (new tab).
 * The look is in site.css ("Seamless loading button").
 */
export function LoadingLink({ href, className = "", children, ...rest }: { href: string; className?: string; children: ReactNode; "aria-label"?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Back/forward cache can restore the page mid-animation: start fresh.
    const reset = (event: PageTransitionEvent) => { if (event.persisted) setLoading(false); };
    window.addEventListener("pageshow", reset);
    return () => { window.removeEventListener("pageshow", reset); window.clearTimeout(timer.current); };
  }, []);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    router.prefetch(href);
    timer.current = window.setTimeout(() => {
      router.push(href);
      // Same-page targets (or a slow network) would leave the spinner running forever.
      timer.current = window.setTimeout(() => setLoading(false), 4000);
    }, LOADING_MS);
  }

  return (
    <a
      {...rest}
      href={href}
      className={`${className} btn-loading${loading ? " is-loading" : ""}`}
      aria-busy={loading}
      aria-disabled={loading || undefined}
      onClick={onClick}
      style={{ "--loading-ms": `${LOADING_MS}ms` } as CSSProperties}
    >
      <span className="btn-loading__fill" aria-hidden="true" />
      <span className="btn-loading__label">{children}</span>
      <span className="btn-loading__status" aria-live="polite">
        {loading && <><span className="btn-loading__spinner" aria-hidden="true" />Уншиж байна…</>}
      </span>
    </a>
  );
}
