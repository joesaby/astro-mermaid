import { initMerman, renderSvg } from '/node_modules/@mermanjs/web/dist/package-entries/full.js';
export const name = 'merman';
export async function init() { await initMerman(); }
export async function render(src) { return renderSvg(src); }
