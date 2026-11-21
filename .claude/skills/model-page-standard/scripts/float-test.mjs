// «Хэмнэлтийн тооцоолуур» check: it sits in the sticky menu until the mouse first moves; then the floating copy
// starts at the menu button's place and follows the pointer.
// Usage: node float-test.mjs <url> <outPrefix>   → <outPrefix>-1-top.png, -2-lifted.png, -3-follow.png + a JSON line
// Headless Edge over CDP; real Input.dispatchMouseEvent and instant scrolls (see SKILL.md "Checking a change").
import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const [url, prefix] = process.argv.slice(2);
const exe = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
const port = 9336;
const proc = spawn(exe, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, "--window-size=1440,900", `--user-data-dir=${process.env.TEMP}\\cdp-edge-float`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const waiting = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
const shot = async (name) => writeFileSync(`${prefix}-${name}.png`, Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64"));
const move = (x, y) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, pointerType: "mouse" });
const rect = (sel) => evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect(); return r && { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) }; })()`);

await send("Page.enable");
await send("Page.navigate", { url });
await sleep(6000);
await evaluate("sessionStorage.clear()");
const slotTop = await rect(".mnav__savings .saving-calculator__trigger");
const shownBefore = await evaluate("document.querySelector('.savings-float')?.classList.contains('is-shown')");
await shot("1-top");

await move(700, 500);
await sleep(60);
const slot = await rect(".mnav__savings .savings-anchor");
const lifted = await rect(".savings-float");
await shot("2-lifted");
for (let i = 0; i < 30; i++) { await move(700 - i * 10, 500 + i * 4); await sleep(30); }
await sleep(1200);
const follow = await rect(".savings-float");
await shot("3-follow");
console.log(JSON.stringify({ shownBefore, slotTop, slot, liftedStart: lifted, afterFollow: follow, pointer: { x: 410, y: 616 } }));
ws.close(); proc.kill();
process.exit(0);
