// Charging stations for the homepage map, from evmashin.com (user's choice, 2026-11-20).
//
//   node scripts/chargers/import-evmashin.mjs        → writes src/data/chargers.json
//
// evmashin.com ships its station list as JSON inside the page's JavaScript bundle (live status comes later
// over a socket). Only public facts are kept: name, address, position, AC/DC connectors, power and plug
// types. Phone numbers, payment and device ids are left out. The page links back to evmashin.com for
// live status. Run again to refresh; check the diff before committing.
import { writeFileSync } from "node:fs";

const SITE = "https://www.evmashin.com";
const OUT = new URL("../../src/data/chargers.json", import.meta.url);
const UA = { "user-agent": "Mozilla/5.0 (ruichi-site charger import)" };

const html = await (await fetch(`${SITE}/`, { headers: UA })).text();
const page = html.match(/\/_next\/static\/chunks\/app\/page-[\w]+\.js/)?.[0];
if (!page) throw new Error("evmashin.com: page bundle not found (site changed?)");
const js = await (await fetch(`${SITE}${page}`, { headers: UA })).text();

// The list is `JSON.parse('[…]')`: read the single-quoted JS string and let JS unescape it.
const at = js.indexOf("JSON.parse('[");
if (at < 0) throw new Error("evmashin.com: station list not found in the bundle (site changed?)");
let i = at + "JSON.parse('".length, literal = "";
while (js[i] !== "'") literal += js[i] === "\\" ? js[i++] + js[i++] : js[i++];
const parks = JSON.parse(Function(`return '${literal}'`)());

const clean = (text) => (text ?? "").replace(/[᠀-᢯\s]+$/u, "").replace(/,?\s*Монгол улс\s*$/i, "").replace(/\s{2,}/g, " ").trim();
const max = (list) => Math.max(0, ...list.map((c) => Number(c.power_kw) || 0));

const stations = parks
  .map((park) => {
    const connectors = park.stations.flatMap((station) => station.connectors ?? []);
    const dc = connectors.filter((c) => c.current_type === "DC");
    const ac = connectors.filter((c) => c.current_type === "AC");
    return {
      name: park.name.replace(/\s*\/.*\/\s*$/, "").trim(),
      address: clean(park.location_text),
      lat: Number(park.geo_lat), lng: Number(park.geo_lng),
      dc: dc.length, dcKw: max(dc), ac: ac.length, acKw: max(ac),
      plugs: [...new Set(connectors.map((c) => c.connector_type).filter(Boolean))]
    };
  })
  // No position or no charger at all (e.g. an office listed without connectors): nothing to show.
  .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng) && s.lat !== 0 && s.dc + s.ac > 0);

const heartbeats = parks.flatMap((p) => p.stations.map((s) => s.last_heartbeat_at)).filter(Boolean).sort();
const data = { source: { name: "evmashin.com", url: SITE, date: (heartbeats.at(-1) ?? new Date().toISOString()).slice(0, 10) }, stations };
writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`${stations.length} stations (${parks.length - stations.length} left out), data as of ${data.source.date} → src/data/chargers.json`);
