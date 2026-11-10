import { mkdir, writeFile } from "node:fs/promises";

const slugs = ["c3-cold", "c3", "c5-cng", "c5-drone", "c5-reev", "c5", "c5l", "c9", "ec31", "ec31l", "ec31s", "ec35", "ec75", "ec75pro-cargo", "ec75pro-passenger", "ed71s", "r5-service", "r5", "r5pro-cargo", "r5pro-passenger"];
await mkdir("public", { recursive: true });
await Promise.all(slugs.map((slug) => writeFile(`public/${slug}.html`, `<!doctype html><html lang="mn"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/models/${slug}/"><link rel="canonical" href="/models/${slug}/"><script>location.replace('/models/${slug}/')</script><title>Redirecting…</title></head><body><a href="/models/${slug}/">Шинэ хуудас руу шилжих</a></body></html>`)));
