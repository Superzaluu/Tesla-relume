import Script from "next/script";

// Cal.com booking popup for "Туршилтын жолоодлого" (user, 2026-11-19). The embed listens for clicks on any
// element carrying these data attributes, so a button anywhere on the site opens the month-view calendar.
// CalScript is mounted once in the root layout; spread calTestDrive onto a <button> to make it a trigger.

export const calTestDrive = {
  "data-cal-link": "sergelenbayar-battulga-amuse/test-drive",
  "data-cal-namespace": "test-drive",
  "data-cal-config": JSON.stringify({ layout: "month_view", useSlotsViewOnSmallScreen: "true" })
} as const;

const init = `(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "test-drive", {origin:"https://app.cal.com"});
Cal.config = Cal.config || {};
Cal.config.forwardQueryParams = true;
Cal.ns["test-drive"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});`;

export function CalScript() {
  return <Script id="cal-test-drive" strategy="afterInteractive">{init}</Script>;
}
