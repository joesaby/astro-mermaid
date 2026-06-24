import { describe, it, expect, vi } from 'vitest';
import { markdownToHtml } from 'satteri';
import { satteri } from '@astrojs/markdown-satteri';
import astroMermaid from '../astro-mermaid-integration.js';

// End-to-end behaviour of the Sätteri mdast plugin (Astro 7). Unlike the
// integration routing tests, these render real markdown through Sätteri's
// native processor so we catch regressions in the *output* HTML — most
// importantly that mermaid's `{...}` decision syntax survives untouched.

/**
 * Run the integration's config:setup hook with a Sätteri processor and return
 * the mdast plugin it registers, so we can render markdown through it.
 */
async function getSatteriMermaidPlugin() {
  const integration = astroMermaid();
  const updateConfigMock = vi.fn();

  await integration.hooks['astro:config:setup']({
    config: { markdown: { processor: satteri() }, root: new URL('file:///test/') },
    updateConfig: updateConfigMock,
    addWatchFile: vi.fn(),
    injectScript: vi.fn(),
    logger: { info: vi.fn(), warn: vi.fn() },
    command: 'build'
  });

  const opts = updateConfigMock.mock.calls[0][0].markdown.processor.options;
  return opts.mdastPlugins.find(p => p?.name === 'astro-mermaid');
}

describe('Sätteri mermaid plugin (end-to-end render)', () => {
  it('transforms mermaid code blocks into <pre class="mermaid">', async () => {
    const plugin = await getSatteriMermaidPlugin();
    const md = ['```mermaid', 'graph TD', '  A[Start] --> B[End]', '```', ''].join('\n');

    const { html } = await markdownToHtml(md, { mdastPlugins: [plugin] });

    expect(html).toContain('<pre class="mermaid">');
    expect(html).toContain('A[Start]');
    // Must NOT be left as a highlighted code block
    expect(html).not.toContain('language-mermaid');
  });

  it('preserves mermaid curly-brace syntax (decision nodes) verbatim', async () => {
    // Regression for #71: returning Sätteri's `{ rawHtml }` escape hatch applies
    // MDX-style brace escaping, turning `B{Decision}` into `B{'{'}Decision{'}'}`
    // and corrupting the diagram. We must emit a plain `html` mdast node instead.
    const plugin = await getSatteriMermaidPlugin();
    const md = ['```mermaid', 'graph TD', '  B{Decision}', '```', ''].join('\n');

    const { html } = await markdownToHtml(md, { mdastPlugins: [plugin] });

    expect(html).toContain('B{Decision}');
    expect(html).not.toContain("{'{'}");
  });

  it('escapes HTML in diagram content but leaves non-mermaid code blocks alone', async () => {
    const plugin = await getSatteriMermaidPlugin();
    const md = [
      '```mermaid',
      'graph TD',
      '  A["Has <br/> break"]',
      '```',
      '',
      '```js',
      'const x = 1;',
      '```',
      ''
    ].join('\n');

    const { html } = await markdownToHtml(md, { mdastPlugins: [plugin] });

    // HTML inside the diagram is escaped to text, not rendered as a tag
    expect(html).toContain('&lt;br/&gt;');
    // The JS block is still a normal (highlighted) code block
    expect(html).toContain('language-js');
    expect(html).toContain('const x');
  });
});
