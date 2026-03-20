import { describe, it, expect, vi } from 'vitest';
import astroMermaid from '../astro-mermaid-integration.js';

describe('astroMermaid Integration', () => {
  describe('configuration', () => {
    it('should create integration with default options', () => {
      const integration = astroMermaid();

      expect(integration).toBeDefined();
      expect(integration.name).toBe('astro-mermaid');
      expect(integration.hooks).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const options = {
        theme: 'forest',
        autoTheme: false,
        mermaidConfig: {
          flowchart: { curve: 'basis' }
        },
        iconPacks: [
          { name: 'test', loader: () => fetch('test.json') }
        ]
      };

      const integration = astroMermaid(options);

      expect(integration).toBeDefined();
      expect(integration.name).toBe('astro-mermaid');
    });
  });

  describe('hooks', () => {
    it('should have astro:config:setup hook', () => {
      const integration = astroMermaid();

      expect(integration.hooks['astro:config:setup']).toBeDefined();
      expect(typeof integration.hooks['astro:config:setup']).toBe('function');
    });

    it('should update config with markdown plugins', async () => {
      const integration = astroMermaid();

      const mockConfig = {
        markdown: {
          remarkPlugins: [],
          rehypePlugins: []
        },
        root: new URL('file:///test/')
      };

      const updateConfigMock = vi.fn();
      const injectScriptMock = vi.fn();
      const loggerMock = {
        info: vi.fn()
      };

      await integration.hooks['astro:config:setup']({
        config: mockConfig,
        updateConfig: updateConfigMock,
        addWatchFile: vi.fn(),
        injectScript: injectScriptMock,
        logger: loggerMock,
        command: 'build'
      });

      // Check that updateConfig was called with markdown plugins
      expect(updateConfigMock).toHaveBeenCalled();
      const updateCall = updateConfigMock.mock.calls[0][0];

      expect(updateCall.markdown).toBeDefined();
      expect(updateCall.markdown.remarkPlugins).toBeDefined();
      expect(updateCall.markdown.rehypePlugins).toBeDefined();
      expect(updateCall.vite.optimizeDeps.include).toContain('mermaid');
    });

    it('should inject client-side scripts', async () => {
      const integration = astroMermaid({
        theme: 'dark',
        autoTheme: true
      });

      const mockConfig = {
        markdown: {},
        root: new URL('file:///test/')
      };

      const injectScriptMock = vi.fn();
      const loggerMock = {
        info: vi.fn()
      };

      await integration.hooks['astro:config:setup']({
        config: mockConfig,
        updateConfig: vi.fn(),
        addWatchFile: vi.fn(),
        injectScript: injectScriptMock,
        logger: loggerMock,
        command: 'build'
      });

      // Check that scripts were injected
      expect(injectScriptMock).toHaveBeenCalledTimes(2); // One for JS, one for CSS

      const jsCall = injectScriptMock.mock.calls[0];
      expect(jsCall[0]).toBe('page');
      expect(jsCall[1]).toContain('import(\'mermaid\')');
      expect(jsCall[1]).toContain('mermaid.initialize');

      const cssCall = injectScriptMock.mock.calls[1];
      expect(cssCall[0]).toBe('page');
      expect(cssCall[1]).toContain('pre.mermaid');
    });
  });

  describe('HTML escaping requirement', () => {
    it('should define escapeHtml function for HTML content preservation', () => {
      // This test documents the requirement for HTML escaping
      // The implementation should include an escapeHtml function

      const testCases = [
        { input: '<u>test</u>', expected: '&lt;u&gt;test&lt;/u&gt;' },
        { input: '<br/>', expected: '&lt;br/&gt;' },
        { input: 'A & B', expected: 'A &amp; B' },
        { input: '"quotes"', expected: '&quot;quotes&quot;' },
        { input: "it's", expected: 'it&#39;s' }
      ];

      // This function should be implemented in the integration
      function escapeHtml(text) {
        const htmlEntities = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, char => htmlEntities[char]);
      }

      testCases.forEach(({ input, expected }) => {
        expect(escapeHtml(input)).toBe(expected);
      });
    });
  });

  describe('security', () => {
    it('should not use new Function or eval in client script', async () => {
      const integration = astroMermaid({
        iconPacks: [
          { name: 'test', url: 'https://example.com/icons.json' }
        ]
      });

      const mockConfig = {
        markdown: {},
        root: new URL('file:///test/')
      };

      const injectScriptMock = vi.fn();

      await integration.hooks['astro:config:setup']({
        config: mockConfig,
        updateConfig: vi.fn(),
        addWatchFile: vi.fn(),
        injectScript: injectScriptMock,
        logger: { info: vi.fn(), warn: vi.fn() },
        command: 'build'
      });

      const clientScript = injectScriptMock.mock.calls[0][1];
      expect(clientScript).not.toContain('new Function');
      expect(clientScript).not.toContain('eval(');
    });

    it('should not inject error.message via innerHTML in client script', async () => {
      const integration = astroMermaid();
      const mockConfig = {
        markdown: {},
        root: new URL('file:///test/')
      };

      const injectScriptMock = vi.fn();

      await integration.hooks['astro:config:setup']({
        config: mockConfig,
        updateConfig: vi.fn(),
        addWatchFile: vi.fn(),
        injectScript: injectScriptMock,
        logger: { info: vi.fn(), warn: vi.fn() },
        command: 'build'
      });

      const clientScript = injectScriptMock.mock.calls[0][1];
      // The error handler should use textContent, not innerHTML with interpolation
      expect(clientScript).toContain('textContent');
      expect(clientScript).not.toMatch(/innerHTML\s*=\s*`[^`]*error\.message/);
    });

    it('should reject mermaidConfig with __proto__ key', () => {
      // Use JSON.parse to create an object that actually has __proto__ as own property
      // (object literals set the prototype instead of creating a key)
      const malicious = JSON.parse('{"__proto__": {"polluted": true}}');
      expect(() => {
        astroMermaid({ mermaidConfig: malicious });
      }).toThrow('"__proto__" is not allowed');
    });

    it('should reject mermaidConfig with constructor key', () => {
      expect(() => {
        astroMermaid({ mermaidConfig: { constructor: {} } });
      }).toThrow('"constructor" is not allowed');
    });

    it('should reject mermaidConfig with nested prototype key', () => {
      expect(() => {
        astroMermaid({ mermaidConfig: { flowchart: { prototype: {} } } });
      }).toThrow('"prototype" is not allowed');
    });

    it('should accept iconPacks with url property', async () => {
      const integration = astroMermaid({
        iconPacks: [
          { name: 'logos', url: 'https://unpkg.com/@iconify-json/logos@1/icons.json' }
        ]
      });

      const mockConfig = {
        markdown: {},
        root: new URL('file:///test/')
      };

      const injectScriptMock = vi.fn();

      await integration.hooks['astro:config:setup']({
        config: mockConfig,
        updateConfig: vi.fn(),
        addWatchFile: vi.fn(),
        injectScript: injectScriptMock,
        logger: { info: vi.fn(), warn: vi.fn() },
        command: 'build'
      });

      const clientScript = injectScriptMock.mock.calls[0][1];
      expect(clientScript).toContain('https://unpkg.com/@iconify-json/logos@1/icons.json');
      expect(clientScript).toContain('fetch(pack.url)');
    });

    it('should extract URL from legacy loader function', async () => {
      const integration = astroMermaid({
        iconPacks: [
          { name: 'test', loader: () => fetch('https://example.com/icons.json').then(res => res.json()) }
        ]
      });

      const mockConfig = {
        markdown: {},
        root: new URL('file:///test/')
      };

      const injectScriptMock = vi.fn();

      await integration.hooks['astro:config:setup']({
        config: mockConfig,
        updateConfig: vi.fn(),
        addWatchFile: vi.fn(),
        injectScript: injectScriptMock,
        logger: { info: vi.fn(), warn: vi.fn() },
        command: 'build'
      });

      const clientScript = injectScriptMock.mock.calls[0][1];
      expect(clientScript).toContain('https://example.com/icons.json');
    });

    it('should sanitize JSON to prevent script injection', async () => {
      const integration = astroMermaid({
        mermaidConfig: { note: '</script><script>alert(1)</script>' }
      });

      const mockConfig = {
        markdown: {},
        root: new URL('file:///test/')
      };

      const injectScriptMock = vi.fn();

      await integration.hooks['astro:config:setup']({
        config: mockConfig,
        updateConfig: vi.fn(),
        addWatchFile: vi.fn(),
        injectScript: injectScriptMock,
        logger: { info: vi.fn(), warn: vi.fn() },
        command: 'build'
      });

      const clientScript = injectScriptMock.mock.calls[0][1];
      // Should not contain a literal </script> — it should be escaped as <\/script>
      expect(clientScript).not.toContain('</script>');
      expect(clientScript).toContain('<\\/script>');
    });
  });

  describe('client-side rendering', () => {
    it('should handle escaped HTML content in client-side code', async () => {
      // Document the requirement for client-side handling
      // The client code should properly handle escaped HTML

      const integration = astroMermaid();
      const mockConfig = {
        markdown: {},
        root: new URL('file:///test/')
      };

      const injectScriptMock = vi.fn();

      await integration.hooks['astro:config:setup']({
        config: mockConfig,
        updateConfig: vi.fn(),
        addWatchFile: vi.fn(),
        injectScript: injectScriptMock,
        logger: { info: vi.fn() },
        command: 'build'
      });

      const clientScript = injectScriptMock.mock.calls[0][1];

      // The client script should:
      // 1. Store original diagram content in data-diagram attribute
      expect(clientScript).toContain('data-diagram');

      // 2. Use textContent to get the escaped content
      expect(clientScript).toContain('textContent');

      // 3. Pass the content to mermaid.render
      expect(clientScript).toContain('mermaid.render');
    });
  });
});