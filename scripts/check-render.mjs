// Render check for the built demo sites.
// Serves a demo's dist/ folder, opens every page that contains a mermaid
// diagram in headless Chromium, and fails if any diagram did not render to SVG.
//
// Usage: node scripts/check-render.mjs <dist-dir> [<dist-dir> ...]
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
};

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith('.html'))
    .map(e => join(e.parentPath, e.name));
}

function serve(root) {
  const server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    try {
      const body = await readFile(join(root, path));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok(server)));
}

const dirs = process.argv.slice(2).map(d => resolve(d));
if (dirs.length === 0) {
  console.error('Usage: node scripts/check-render.mjs <dist-dir> [...]');
  process.exit(2);
}

const browser = await chromium.launch();
const failures = [];
let checked = 0;

for (const root of dirs) {
  const server = await serve(root);
  const base = `http://127.0.0.1:${server.address().port}`;

  for (const file of await htmlFiles(root)) {
    const html = await readFile(file, 'utf8');
    if (!html.includes('class="mermaid"')) continue;

    const route = '/' + file.slice(root.length + 1).replace(/index\.html$/, '');
    const page = await browser.newPage();
    await page.goto(base + route, { waitUntil: 'load' });

    try {
      await page.waitForFunction(
        () => [...document.querySelectorAll('pre.mermaid')].every(d => d.hasAttribute('data-processed')),
        null,
        { timeout: 30000 }
      );
    } catch {
      failures.push(`${root}${route}: timed out waiting for diagrams to render`);
      await page.close();
      continue;
    }

    const bad = await page.$$eval('pre.mermaid', els =>
      els
        .map((el, i) => ({ i, ok: !!el.querySelector('svg'), text: el.textContent.trim().slice(0, 120) }))
        .filter(d => !d.ok)
    );
    const total = await page.$$eval('pre.mermaid', els => els.length);
    checked += total;
    for (const d of bad) failures.push(`${root}${route} diagram #${d.i + 1}: ${d.text}`);
    console.log(`${bad.length ? 'FAIL' : 'ok  '} ${route} (${total} diagrams)`);
    await page.close();
  }

  server.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} diagram(s) failed to render:`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
console.log(`\nAll ${checked} diagrams rendered.`);
