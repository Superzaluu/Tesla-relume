// Screenshot the viewport with a selector scrolled to the top, optionally after clicking another selector.
// Usage: node section-shot.mjs <url> <selector> <out.png> [width] [height] [clickSelector]
// Headless Edge over CDP; a selector inside a closed <details> has no box, so scroll to its card instead.
import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const [url, selector, out, width = "1440", height = "1000"] = process.argv.slice(2);
const exe = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
const port = 9334;
const proc = spawn(exe, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, `--window-size=${width},${height}`, `--user-data-dir=${process.env.TEMP}\\cdp-edge2`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const waiting = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(6000);
await send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start', behavior:'instant'}); window.scrollBy(0, -80);` });
await sleep(800);
if (process.argv[7]) {
  await send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(process.argv[7])}).click()` });
  await sleep(1400);
}
const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(out, Buffer.from(shot.data, "base64"));
ws.close(); proc.kill();
process.exit(0);

