// Usage: node compare.mjs -> results/compare.json, results/compare.md, results/sheet.html
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const engines = ['mermaidjs', 'merman', 'mmdr'];
const J = Object.fromEntries(engines.map(e => [e, JSON.parse(readFileSync(`results/${e}.json`, 'utf8'))]));
const ids = J.mermaidjs.results.map(r => r.id);
const kind = id => readFileSync(`corpus/${id}.mmd`, 'utf8').replace(/^---[\s\S]*?---\s*/, '').trim().split(/[\s\n]/)[0].replace('-v2', '');

function dims(svg) {
  const vb = svg.match(/viewBox="([-\d.\s]+)"/);
  if (vb) { const [, , w, h] = vb[1].trim().split(/\s+/).map(Number); return { w, h }; }
  const w = svg.match(/<svg[^>]*\swidth="([\d.]+)/), h = svg.match(/<svg[^>]*\sheight="([\d.]+)/);
  return { w: w ? +w[1] : NaN, h: h ? +h[1] : NaN };
}
const words = svg => new Set(
  [...svg.replace(/<style[\s\S]*?<\/style>/g, '').matchAll(/>([^<>]+)</g)].flatMap(m => m[1].toLowerCase().match(/[a-z0-9]{2,}/g) ?? []));
const jacc = (a, b) => { if (!a.size && !b.size) return 1; let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); };
const median = a => { a = [...a].sort((x, y) => x - y); return a[a.length >> 1]; };

const rows = ids.map(id => {
  const row = { id, kind: kind(id) };
  const ref = readFileSync(`results/mermaidjs/${id}.svg`, 'utf8'), refD = dims(ref), refW = words(ref);
  for (const e of engines) {
    const r = J[e].results.find(x => x.id === id);
    const o = { firstMs: r.firstMs, warmMs: r.warmMs, error: r.error };
    if (!r.error) {
      const svg = readFileSync(`results/${e}/${id}.svg`, 'utf8'), d = dims(svg);
      Object.assign(o, { bytes: svg.length, w: d.w, h: d.h, shapes: (svg.match(/<(rect|path|circle|ellipse|polygon|line)\b/g) ?? []).length,
        textSim: jacc(refW, words(svg)), areaRatio: (d.w * d.h) / (refD.w * refD.h), aspectRatio: (d.w / d.h) / (refD.w / refD.h) });
    }
    row[e] = o;
  }
  return row;
});
writeFileSync('results/compare.json', JSON.stringify({ init: Object.fromEntries(engines.map(e => [e, J[e].initMs])), rows }, null, 1));

const kinds = [...new Set(rows.map(r => r.kind))];
const f = (n, d = 1) => Number.isFinite(n) ? n.toFixed(d) : '-';
let md = '## Per-diagram-type (median over diagrams)\n\n| type | n | mermaid.js first/warm ms | merman first/warm ms | mmdr first/warm ms | merman textSim / areaRatio | mmdr textSim / areaRatio |\n|---|---|---|---|---|---|---|\n';
for (const k of kinds) {
  const rs = rows.filter(r => r.kind === k);
  const m = (e, key) => median(rs.map(r => r[e][key]).filter(Number.isFinite));
  md += `| ${k} | ${rs.length} | ${f(m('mermaidjs', 'firstMs'))} / ${f(m('mermaidjs', 'warmMs'))} | ${f(m('merman', 'firstMs'))} / ${f(m('merman', 'warmMs'))} | ${f(m('mmdr', 'firstMs'))} / ${f(m('mmdr', 'warmMs'))} | ${f(m('merman', 'textSim'), 2)} / ${f(m('merman', 'areaRatio'), 2)} | ${f(m('mmdr', 'textSim'), 2)} / ${f(m('mmdr', 'areaRatio'), 2)} |\n`;
}
const tot = (e, k) => rows.reduce((a, r) => a + (r[e][k] || 0), 0);
md += `\n## Totals (${rows.length} diagrams)\n\n| engine | init ms | first-render total ms | warm total ms | errors | median textSim vs mermaid.js | median areaRatio | median aspectRatio |\n|---|---|---|---|---|---|---|---|\n`;
for (const e of engines) md += `| ${e} | ${f(J[e].initMs, 0)} | ${f(tot(e, 'firstMs'), 0)} | ${f(tot(e, 'warmMs'), 0)} | ${rows.filter(r => r[e].error).length} | ${f(median(rows.map(r => r[e].textSim).filter(Number.isFinite)), 2)} | ${f(median(rows.map(r => r[e].areaRatio).filter(Number.isFinite)), 2)} | ${f(median(rows.map(r => r[e].aspectRatio).filter(Number.isFinite)), 2)} |\n`;
md += '\n## Largest differences (textSim < 0.6 or area/aspect off by >2x vs mermaid.js)\n\n| diagram | type | engine | textSim | areaRatio | aspectRatio |\n|---|---|---|---|---|---|\n';
for (const r of rows) for (const e of ['merman', 'mmdr']) { const o = r[e];
  if (o.error || o.textSim < 0.6 || o.areaRatio > 2 || o.areaRatio < 0.5 || o.aspectRatio > 2 || o.aspectRatio < 0.5)
    md += `| ${r.id} | ${r.kind} | ${e} | ${f(o.textSim, 2)} | ${f(o.areaRatio, 2)} | ${f(o.aspectRatio, 2)} ${o.error ? o.error : ''} |\n`; }
writeFileSync('results/compare.md', md);

let html = '<!doctype html><meta charset=utf-8><style>body{font:12px sans-serif;background:#fff}table{border-collapse:collapse}td{vertical-align:top;border:1px solid #ccc;padding:4px;width:33%}td svg,td img{max-width:100%;max-height:360px;height:auto}h4{margin:8px 0 2px}</style>';
for (const r of rows) {
  html += `<h4>${r.id} (${r.kind})</h4><table><tr>` + engines.map(e => `<td>${e}<br><img src="${e}/${r.id}.svg"></td>`).join('') + '</tr></table>';
}
writeFileSync('results/sheet.html', html);
console.log(md);
