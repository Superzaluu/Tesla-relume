// Screenshot a whole page as consecutive strips for review (headless Edge over CDP).
// Usage: node page-strips.mjs <url> <outDir> [prefix=strip] [width=1440] [height=1100] [scale=0.5]
// Forces RevealOnScroll blocks visible and lazy images eager, hides the floating savings button.
import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const [url, outDir, prefix = "strip", width = "1440", height = "1100", scale = "0.5"] = process.argv.slice(2);
const exe = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
const port = 9339;
const proc = spawn(exe, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--window-size=${width},${height}`, `--user-data-dir=${process.env.TEMP}\\cdp-edge7-${Date.now()}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const waiting = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { returnByValue: true, expression })).result.value;
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(7000);
await evaluate(`document.querySelectorAll('img[loading=lazy]').forEach((i) => i.loading = 'eager')`);
await sleep(2500);
// Hide the floating follower and the dev badge so they do not repeat on every strip.
await evaluate(`(() => { const s = document.createElement('style'); s.textContent = '.savings-float, nextjs-portal { display:none !important } html { scroll-behavior:auto !important } .rv { opacity:1 !important; transform:none !important } img { content-visibility:visible }'; document.head.append(s); })()`);
const total = await evaluate(`document.documentElement.scrollHeight`);
const h = Number(height);
let n = 0;
for (let y = 0; y < total; y += h) {
  const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 70, captureBeyondViewport: true, clip: { x: 0, y, width: Number(width), height: Math.min(h, total - y), scale: Number(scale) } });
  writeFileSync(`${outDir}\\${prefix}-${String(++n).padStart(2, "0")}.jpg`, Buffer.from(shot.data, "base64"));
}
console.log(JSON.stringify({ total, strips: n }));
ws.close(); proc.kill();
process.exit(0);
