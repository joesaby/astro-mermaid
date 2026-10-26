// Extracts every ```mermaid block from the demo docs into spike/corpus/*.mmd
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = 'astro-demo/src/content/docs';
const out = 'spike/corpus';
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
let n = 0;
for (const f of walk(root).filter(f => /\.mdx?$/.test(f))) {
  const src = readFileSync(f, 'utf8');
  let i = 0;
  for (const m of src.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
    const name = relative(root, f).replace(/\.mdx?$/, '').replace(/\//g, '_') + '-' + (++i);
    writeFileSync(join(out, name + '.mmd'), m[1]);
    n++;
  }
}
console.log(n, 'diagrams');
