// Hero icon previews (QuickPeek) check: hovers icon N with a real mouse, screenshots the preview, then clicks it
// and reports where the page jumped (the hash and the element at the top).
// Usage: node peek-test.mjs <url> <iconIndex 0-8> <out.png>
import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const [url, index = "7", out] = process.argv.slice(2);
const exe = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
const port = 9361;
const proc = spawn(exe, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--window-size=1440,900", `--user-data-dir=${process.env.TEMP}\\cdp-edge-peek`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const waiting = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const mouse = (type, x, y) => send("Input.dispatchMouseEvent", { type, x, y, button: type === "mouseMoved" ? "none" : "left", clickCount: type === "mouseMoved" ? 0 : 1, pointerType: "mouse" });

await send("Page.navigate", { url });
await sleep(6000);
// Opened calculator is remembered per session; keep it from following the mouse over the icons.
await evaluate("sessionStorage.setItem('savings-calculator-opened', '1')");
await send("Page.reload");
await sleep(5000);
const items = await evaluate(`[...document.querySelectorAll('.hero__quick-spec')].map((el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, peek: el.matches('a, button, [data-peek], .quick-peek') || !!el.querySelector('a, button') }; })`);
const item = items?.[Number(index)];
if (!item) { console.log(JSON.stringify({ error: "no icon", count: items?.length })); process.exit(1); }
await mouse("mouseMoved", item.x - 40, item.y - 40);
await mouse("mouseMoved", item.x, item.y);
await sleep(900);
writeFileSync(out, Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64"));
const preview = await evaluate("document.querySelector('.quick-peek__card, [role=tooltip], .qpeek')?.innerText?.replace(/\\s+/g, ' ') ?? null");
await mouse("mousePressed", item.x, item.y);
await mouse("mouseReleased", item.x, item.y);
await sleep(1500);
const jumped = await evaluate("({ hash: location.hash, scrollY: Math.round(scrollY) })");
console.log(JSON.stringify({ icons: items.length, withPeek: items.filter((i) => i.peek).length, preview, jumped }));
ws.close(); proc.kill();
process.exit(0);
