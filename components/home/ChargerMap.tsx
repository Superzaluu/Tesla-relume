"use client";
// Real charging stations on an OpenStreetMap map (Leaflet). Green = fast DC, blue = AC only.
// Leaflet touches `window`, so it is loaded in the browser only; until then the box shows a plain list link.
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { ChargerStation } from "@/data/chargers";

const DC = "#0f8a52";
const AC = "#2f6fb2";

const escape = (text: string) => text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function popup(station: ChargerStation) {
  const kinds = [
    station.dc ? `<b style="color:${DC}">DC хурдан</b> · ${station.dc} цэг${station.dcKw ? ` · ${station.dcKw} кВт хүртэл` : ""}` : "",
    station.ac ? `<b style="color:${AC}">AC</b> · ${station.ac} цэг${station.acKw ? ` · ${station.acKw} кВт хүртэл` : ""}` : ""
  ].filter(Boolean).join("<br>");
  const route = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
  return `<div style="min-width:200px;font:13px/1.45 var(--font-body,system-ui)">
    <strong style="font-size:14px">${escape(station.name)}</strong><br>
    ${station.address ? `<span style="color:#5b6b78">${escape(station.address)}</span><br>` : ""}
    <div style="margin:6px 0">${kinds}</div>
    ${station.plugs.length ? `<span style="color:#5b6b78">${escape(station.plugs.join(", "))}</span><br>` : ""}
    <a href="${route}" target="_blank" rel="noopener" style="display:inline-block;margin-top:6px;font-weight:600;color:#0f5a3a">Очих →</a>
  </div>`;
}

export function ChargerMap({ stations, center }: { stations: ChargerStation[]; center: [number, number] }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !box.current) return;
      map = L.map(box.current, { scrollWheelZoom: false, attributionControl: true }).setView(center, 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(map);
      for (const station of stations) {
        const color = station.dc ? DC : AC;
        L.circleMarker([station.lat, station.lng], { radius: station.dc ? 8 : 6, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 })
          .bindPopup(popup(station))
          .addTo(map);
      }
    });
    return () => { cancelled = true; map?.remove(); };
  }, [stations, center]);

  return <div ref={box} className="h-full w-full" role="region" aria-label="Цэнэглэх станцуудын газрын зураг" />;
}
