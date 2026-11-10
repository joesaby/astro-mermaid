import mermaid from '/node_modules/mermaid/dist/mermaid.esm.min.mjs';
export const name = 'mermaidjs';
export async function init() {
  mermaid.initialize({ startOnLoad: false, theme: 'default' });
}
let n = 0;
export async function render(src) {
  const { svg } = await mermaid.render('m' + n++, src);
  return svg;
}
