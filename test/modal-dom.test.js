// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import astroMermaid from '../astro-mermaid-integration.js';

// Pull the real client-side script the integration injects, then load it into
// jsdom so we can exercise the modal end-to-end (click -> open -> SVG clone with
// rewritten ids). This verifies the actual emitted code, not a copy of it.
async function getClientScript() {
  const integ = astroMermaid();
  let js;
  await integ.hooks['astro:config:setup']({
    config: { markdown: {}, root: new URL('file:///t/') },
    updateConfig() {},
    addWatchFile() {},
    injectScript: (stage, code) => { if (js === undefined) js = code; },
    logger: { info() {}, warn() {} },
    command: 'build'
  });
  return js;
}

function makeDiagram() {
  // A pre.mermaid containing a rendered SVG with internal ids + url(#) refs,
  // plus the trigger button the integration would have added.
  const pre = document.createElement('pre');
  pre.className = 'mermaid';
  pre.setAttribute('data-processed', 'true');
  pre.innerHTML = `
    <svg id="diagram-root" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowhead"><path d="M0 0L10 5L0 10z"/></marker>
        <linearGradient id="grad"><stop offset="0"/></linearGradient>
      </defs>
      <path d="M0 0L100 100" marker-end="url(#arrowhead)"/>
      <rect fill="url(#grad)" width="10" height="10"/>
    </svg>
    <button type="button" class="mermaid-modal-btn" aria-label="Open diagram in fullscreen"></button>
  `;
  document.body.appendChild(pre);
  return pre;
}

describe('modal DOM behaviour', () => {
  beforeAll(async () => {
    const js = await getClientScript();
    // The injected script has no static imports/exports, so it runs as a
    // classic script. Indirect eval executes the top-level code in the jsdom
    // global scope: it defines the modal helpers and attaches the single
    // delegated click + keydown listeners to `document`.
    (0, eval)(js);
  });

  it('opens a single shared modal when the trigger is clicked', () => {
    const pre = makeDiagram();
    expect(document.querySelector('.mermaid-modal-overlay')).toBeNull();

    pre.querySelector('.mermaid-modal-btn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const overlay = document.querySelector('.mermaid-modal-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.classList.contains('show')).toBe(true);
    expect(document.querySelector('.diagram-wrapper svg')).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('reuses the same modal element for a second diagram (no accumulation)', () => {
    const before = document.querySelectorAll('.mermaid-modal-overlay').length;
    const pre = makeDiagram();
    pre.querySelector('.mermaid-modal-btn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(document.querySelectorAll('.mermaid-modal-overlay').length).toBe(before);
  });

  it('rewrites cloned SVG ids and url(#) references to avoid duplicate ids', () => {
    const pre = makeDiagram();
    pre.querySelector('.mermaid-modal-btn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const clone = document.querySelector('.diagram-wrapper svg');
    // The clone's ids must differ from the originals still in the page.
    expect(clone.id).not.toBe('diagram-root');
    expect(clone.querySelector('#arrowhead')).toBeNull();
    expect(clone.querySelector('#grad')).toBeNull();

    const marker = clone.querySelector('marker');
    const path = clone.querySelector('path[marker-end]');
    const rect = clone.querySelector('rect');
    // The reference must point at the rewritten id, not the stale original.
    expect(path.getAttribute('marker-end')).toBe(`url(#${marker.id})`);
    const gradId = clone.querySelector('linearGradient').id;
    expect(rect.getAttribute('fill')).toBe(`url(#${gradId})`);

    // The original diagram in the page is untouched.
    expect(document.querySelector('pre.mermaid svg#diagram-root')).not.toBeNull();
  });

  it('closes on Escape and restores body scroll', () => {
    const pre = makeDiagram();
    pre.querySelector('.mermaid-modal-btn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(document.querySelector('.mermaid-modal-overlay').classList.contains('show')).toBe(true);

    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('.mermaid-modal-overlay').classList.contains('show')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });
});
