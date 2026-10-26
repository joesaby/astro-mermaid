// Usage: node bench.mjs <engine> [iters]  -> results/<engine>.json + results/<engine>/*.svg
import http from 'node:http';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/astro-mermaid/package.json');
const { chromium } = require('playwright');

const engine = process.argv[2], iters = +(process.argv[3] ?? 5);
const root = resolve('.');
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.wasm': 'application/wasm', '.json': 'application/json', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root) || !existsSync(p) || statSync(p).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' }).end(readFileSync(p));
}).listen(0);
const port = server.address().port;

const corpus = readdirSync('corpus').filter(f => f.endsWith('.mmd')).sort()
  .map(f => [f.replace('.mmd', ''), readFileSync(join('corpus', f), 'utf8')]);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => m.type() === 'error' && console.error('[page]', m.text()));
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.goto(`http://localhost:${port}/bench.html?engine=${engine}`);
await page.waitForFunction('window.ready', null, { timeout: 30000 });
const out = await page.evaluate(([c, i]) => window.runBench(c, i), [corpus, iters]);
await browser.close(); server.close();

mkdirSync(`results/${engine}`, { recursive: true });
for (const r of out.results) { if (r.svg) writeFileSync(`results/${engine}/${r.id}.svg`, r.svg); delete r.svg; }
writeFileSync(`results/${engine}.json`, JSON.stringify(out, null, 1));
const ok = out.results.filter(r => !r.error);
const sum = k => ok.reduce((a, r) => a + r[k], 0).toFixed(0);
console.log(`${engine}: init ${out.initMs.toFixed(0)}ms, ok ${ok.length}/${out.results.length}, first-render total ${sum('firstMs')}ms, warm total ${sum('warmMs')}ms`);
