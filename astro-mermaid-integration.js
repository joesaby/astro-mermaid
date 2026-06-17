import { resolve } from 'import-meta-resolve';

/**
 * Helper function to HTML-escape text content
 * This ensures HTML tags in mermaid diagrams are preserved as text
 */
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

/**
 * Sanitize a JSON string for safe embedding inside a <script> tag.
 * Prevents premature script termination via </script> or <!-- sequences.
 */
function sanitizeJsonForScript(jsonStr) {
  return jsonStr
    .replace(/<\//g, '<\\/')
    .replace(/<!--/g, '<\\!--');
}

/**
 * Validate that mermaidConfig is a plain object (not an array, null, etc.)
 * and does not contain __proto__ or constructor keys to prevent prototype pollution.
 */
function validateConfig(obj, path = 'mermaidConfig') {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return;
  }
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  // Use getOwnPropertyNames to catch __proto__ which Object.keys skips
  for (const key of Object.getOwnPropertyNames(obj)) {
    if (dangerous.includes(key)) {
      throw new Error(`astro-mermaid: "${key}" is not allowed in ${path}`);
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      validateConfig(obj[key], `${path}.${key}`);
    }
  }
}

/**
 * Remark plugin to transform mermaid code blocks at the markdown level
 */
function remarkMermaidPlugin(options = {}) {
  return async function transformer(tree, file) {
    const { visit } = await import('unist-util-visit');

    let mermaidCount = 0;

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid') {
        mermaidCount++;

        // Transform to html node with pre.mermaid, escaping HTML content
        const htmlNode = {
          type: 'html',
          value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>`
        };

        // Replace the code node with html node
        if (parent && typeof index === 'number') {
          parent.children[index] = htmlNode;
        }

        if (options.logger) {
          options.logger.info(`Remark transformed mermaid block #${mermaidCount} in ${file.path || 'unknown file'}`);
        }
      }
    });

    if (mermaidCount > 0 && options.logger) {
      options.logger.info(`Remark total mermaid blocks transformed: ${mermaidCount}`);
    }
  };
}

/**
 * Escape a string for safe use inside an HTML attribute value.
 */
function escapeAttribute(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

/**
 * Allowlist of safe HTML tag names that may appear inside mermaid HAST content.
 */
const ALLOWED_TAG_NAMES = new Set([
  'b', 'i', 'u', 'em', 'strong', 'br', 'hr', 'sub', 'sup', 'span', 'div',
  'code', 'pre', 'img', 'a', 'p', 'ul', 'ol', 'li'
]);

/**
 * Helper function to serialize HAST nodes back to HTML text
 * This preserves HTML tags within the mermaid content
 */
function serializeHastChildren(children) {
  let result = '';

  for (const child of children) {
    if (child.type === 'text') {
      result += child.value;
    } else if (child.type === 'element') {
      // Reconstruct the HTML tag — only allow safe tag names
      const tagName = child.tagName;
      if (!ALLOWED_TAG_NAMES.has(tagName)) {
        // Skip disallowed tags, but still serialize their text children
        if (child.children && child.children.length > 0) {
          result += serializeHastChildren(child.children);
        }
        continue;
      }
      const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName);

      result += `<${tagName}`;

      // Add attributes if any — escape all attribute values
      if (child.properties) {
        for (const [key, value] of Object.entries(child.properties)) {
          if (key !== 'className') {
            result += ` ${key}="${escapeAttribute(value)}"`;
          } else if (Array.isArray(value)) {
            result += ` class="${escapeAttribute(value.join(' '))}"`;
          }
        }
      }

      if (selfClosing) {
        result += '/>';
      } else {
        result += '>';
        if (child.children && child.children.length > 0) {
          result += serializeHastChildren(child.children);
        }
        result += `</${tagName}>`;
      }
    }
  }

  return result;
}

/**
 * Rehype plugin to transform mermaid code blocks
 * Converts ```mermaid code blocks to <pre class="mermaid">
 */
function rehypeMermaidPlugin(options = {}) {
  return async function transformer(tree, file) {
    const { visit } = await import('unist-util-visit');

    let mermaidCount = 0;

    visit(tree, 'element', (node, index, parent) => {
      // Look for <pre><code class="language-mermaid">
      if (
        node.tagName === 'pre' &&
        node.children?.length === 1 &&
        node.children[0].tagName === 'code'
      ) {
        const codeNode = node.children[0];
        const className = codeNode.properties?.className;

        if (Array.isArray(className) && className.includes('language-mermaid')) {
          mermaidCount++;
          // Get the mermaid diagram content, preserving HTML tags
          const diagramContent = serializeHastChildren(codeNode.children || []);

          // Transform to <pre class="mermaid">
          node.properties = {
            ...node.properties,
            className: ['mermaid']
          };

          // Escape HTML to preserve it as text content
          node.children = [{
            type: 'text',
            value: escapeHtml(diagramContent)
          }];

          if (options.logger) {
            options.logger.info(`Rehype transformed mermaid block #${mermaidCount} in ${file.path || 'unknown file'}`);
          }
        }
      }
    });

    if (mermaidCount > 0 && options.logger) {
      options.logger.info(`Rehype total mermaid blocks transformed: ${mermaidCount}`);
    }
  };
}

/** Detect if optional peer dependency `@mermaid-js/layout-elk` is available. */
async function isElkInstalled(logger, consumerRoot) {
  try {
    resolve('@mermaid-js/layout-elk', `${consumerRoot.href}package.json`);
    logger.info('Enabling ELK support');
    return true;
  } catch {
    logger.info('Skipping ELK support');
    return false;
  }
}

/**
 * Astro integration for rendering Mermaid diagrams
 * Supports automatic theme switching and client-side rendering
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.theme='default'] - Default theme ('default', 'dark', 'forest', 'neutral')
 * @param {boolean} [options.autoTheme=true] - Enable automatic theme switching based on data-theme attribute
 * @param {Object} [options.mermaidConfig={}] - Additional mermaid configuration options
 * @param {boolean} [options.enableLog=true] - Enable client-side logging
 * @returns {import('astro').AstroIntegration}
 */
export default function astroMermaid(options = {}) {
  const {
    theme = 'default',
    autoTheme = true,
    mermaidConfig = {},
    iconPacks = [],
    enableLog = true
  } = options;

  // Validate mermaidConfig to prevent prototype pollution
  validateConfig(mermaidConfig);

  return {
    name: 'astro-mermaid',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig, addWatchFile, injectScript, logger, command }) => {
        logger.info('Setting up Mermaid integration');

        // Log existing rehype plugins
        logger.info('Existing rehype plugins:', config.markdown?.rehypePlugins?.length || 0);

        // Always include mermaid.
        const viteOptimizeDepsInclude = ['mermaid'];
        
        // Conditionally include ELK
        const useElk = await isElkInstalled(logger, config.root);
        if (useElk) {
          viteOptimizeDepsInclude.push('@mermaid-js/layout-elk');
        }

        const remarkEntry = [remarkMermaidPlugin, { logger }];
        const rehypeEntry = [rehypeMermaidPlugin, { logger }];
        const viteConfig = { optimizeDeps: { include: viteOptimizeDepsInclude } };

        // Astro 6.4+ deprecated `markdown.remarkPlugins` / `markdown.rehypePlugins`
        // in favor of passing plugins to `unified({...})` via `markdown.processor`.
        // On 6.4+ Astro always supplies a default unified processor, so its
        // presence is our signal to use the new API and avoid the deprecation
        // warning. Older Astro versions have no processor — fall back to the
        // (still-supported there) plugin arrays. Fixes #62.
        const existingProcessor = config.markdown?.processor;
        let usedProcessor = false;

        if (existingProcessor) {
          try {
            const { unified, isUnifiedProcessor } = await import('@astrojs/markdown-remark');
            if (isUnifiedProcessor(existingProcessor)) {
              const existingOptions = existingProcessor.options || {};
              updateConfig({
                markdown: {
                  processor: unified({
                    ...existingOptions,
                    remarkPlugins: [...(existingOptions.remarkPlugins || []), remarkEntry],
                    rehypePlugins: [...(existingOptions.rehypePlugins || []), rehypeEntry]
                  })
                },
                vite: viteConfig
              });
              usedProcessor = true;
            }
          } catch (error) {
            // Dynamic import failed, the unified processor helpers are not
            // exported, or updateConfig rejected the processor — fall through
            // to the legacy plugin arrays below.
            logger.warn(
              `Could not configure the unified markdown processor, falling back ` +
              `to remark/rehype plugin arrays: ${error.message}`
            );
          }
        }

        if (!usedProcessor) {
          // Update markdown config to use both remark and rehype plugins
          updateConfig({
            markdown: {
              remarkPlugins: [
                ...(config.markdown?.remarkPlugins || []),
                remarkEntry
              ],
              rehypePlugins: [
                ...(config.markdown?.rehypePlugins || []),
                rehypeEntry
              ]
            },
            vite: viteConfig
          });
        }

        // Validate and serialize icon packs for client-side use.
        // Only the pack name and either inline icon data or a JSON URL string
        // are forwarded to the client — we never serialize arbitrary function
        // bodies.
        const iconPacksConfig = iconPacks.map(pack => {
          if (typeof pack.name !== 'string' || !pack.name) {
            throw new Error('astro-mermaid: each iconPack must have a non-empty "name" string');
          }
          if (pack.icons) {
            // Preferred: inline icon data passed directly (e.g. imported JSON).
            // Plain data, so there are no serialization concerns. Fixes #18.
            return { name: pack.name, icons: pack.icons };
          }
          if (typeof pack.url === 'string') {
            // Explicit URL
            return { name: pack.name, url: pack.url };
          }
          if (typeof pack.loader === 'function') {
            // Legacy: extract URL from loader().toString() if it contains a
            // fetch('...') call, otherwise warn and skip.
            const src = pack.loader.toString();
            const urlMatch = src.match(/fetch\s*\(\s*['"]([^'"]+)['"]\s*\)/);
            if (urlMatch) {
              return { name: pack.name, url: urlMatch[1] };
            }
            logger.warn(
              `astro-mermaid: iconPack "${pack.name}" uses a loader function ` +
              `that could not be safely serialized. Please provide a "url" ` +
              `or "icons" property instead. This pack will be skipped.`
            );
            return null;
          }
          throw new Error(
            `astro-mermaid: iconPack "${pack.name}" must have a "url" string, ` +
            `an "icons" object, or a "loader" function`
          );
        }).filter(Boolean);

        // Inject client-side mermaid script with conditional loading
        const mermaidScriptContent = `
// Logging helpers — controlled by enableLog option
const log = ${enableLog} ? (...args) => console.log('[astro-mermaid]', ...args) : () => {};
const logError = (...args) => console.error('[astro-mermaid]', ...args);

// Check if page has mermaid diagrams
const hasMermaidDiagrams = () => {
  return document.querySelectorAll('pre.mermaid').length > 0;
};

// Shared mermaid initialization function
let mermaidPromise = null;
let mermaidInstance = null;

async function loadMermaid() {
  if (mermaidPromise) return mermaidPromise;

  log('Loading mermaid.js...');

  mermaidPromise = import('mermaid').then(async ({ default: mermaid }) => {
    // Register icon packs if provided — uses safe fetch(url) instead of eval
    const iconPacks = ${sanitizeJsonForScript(JSON.stringify(iconPacksConfig))};
    if (iconPacks && iconPacks.length > 0) {
      log('Registering', iconPacks.length, 'icon packs');
      const packs = iconPacks.map(pack => {
        if (pack.icons) {
          // Inline icon data — register directly, no fetch needed
          return { name: pack.name, icons: pack.icons };
        }
        return {
          name: pack.name,
          loader: () => fetch(pack.url).then(res => res.json())
        };
      });
      await mermaid.registerIconPacks(packs);
    }

    // Register ELK layouts if the optional peer is available at build-time
    ${useElk ? `
const elkModule = await import("@mermaid-js/layout-elk").catch(() => null);
if (elkModule?.default) {
  log('Registering elk layouts');
  mermaid.registerLayoutLoaders(elkModule.default);
}
` : ``}

    mermaidInstance = mermaid;
    return mermaid;
  }).catch(error => {
    logError('Failed to load mermaid:', error);
    mermaidPromise = null;
    throw error;
  });

  return mermaidPromise;
}

// Mermaid configuration
const defaultConfig = ${sanitizeJsonForScript(JSON.stringify({
  startOnLoad: false,
  theme: theme,
  ...mermaidConfig
}))};

// Theme mapping for auto-theme switching
const themeMap = {
  'light': 'default',
  'dark': 'dark'
};

// Initialize all mermaid diagrams
async function initMermaid() {
  log('Initializing mermaid diagrams...');
  const diagrams = document.querySelectorAll('pre.mermaid');

  log('Found', diagrams.length, 'mermaid diagrams');

  if (diagrams.length === 0) {
    return;
  }

  // Load mermaid if not already loaded
  const mermaid = await loadMermaid();

  // Get current theme from multiple sources
  let currentTheme = defaultConfig.theme;

  if (${autoTheme}) {
    // Check both html and body for data-theme attribute
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    const bodyTheme = document.body.getAttribute('data-theme');
    const dataTheme = htmlTheme || bodyTheme;
    currentTheme = themeMap[dataTheme] || defaultConfig.theme;
    log('Using theme:', currentTheme, 'from', htmlTheme ? 'html' : 'body');
  }

  // Configure mermaid with gitGraph support
  mermaid.initialize({
    ...defaultConfig,
    theme: currentTheme,
    gitGraph: {
      mainBranchName: 'main',
      showCommitLabel: true,
      showBranches: true,
      rotateCommitLabel: true
    }
  });

  // Render each diagram
  for (const diagram of diagrams) {
    // Skip if already processed
    if (diagram.hasAttribute('data-processed')) continue;

    // Store original content
    if (!diagram.hasAttribute('data-diagram')) {
      diagram.setAttribute('data-diagram', diagram.textContent || '');
    }

    const diagramDefinition = diagram.getAttribute('data-diagram') || '';
    const id = 'mermaid-' + Math.random().toString(36).slice(2, 11);

    log('Rendering diagram:', id);

    try {
      // Clear any existing error state
      const existingGraph = document.getElementById(id);
      if (existingGraph) {
        existingGraph.remove();
      }

      const { svg } = await mermaid.render(id, diagramDefinition);
      diagram.innerHTML = svg;
      diagram.setAttribute('data-processed', 'true');
      addModalTrigger(diagram);
      log('Successfully rendered diagram:', id);
    } catch (error) {
      logError('Mermaid rendering error for diagram:', id, error);
      // Build error UI safely — use textContent to prevent XSS via error messages
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'color: red; padding: 1rem; border: 1px solid red; border-radius: 0.5rem;';
      const strong = document.createElement('strong');
      strong.textContent = 'Error rendering diagram:';
      const msg = document.createElement('span');
      msg.textContent = ' ' + (error.message || 'Unknown error');
      errorDiv.appendChild(strong);
      errorDiv.appendChild(msg);
      diagram.textContent = '';
      diagram.appendChild(errorDiv);
      diagram.setAttribute('data-processed', 'true');
    }
  }
}

// Initialize on first load if there are diagrams
if (hasMermaidDiagrams()) {
  log('Mermaid diagrams detected on initial load');
  initMermaid();
} else {
  log('No mermaid diagrams found on initial load');
}

// Re-render on theme change if auto-theme is enabled
if (${autoTheme}) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        // Reset processed state and re-render
        document.querySelectorAll('pre.mermaid[data-processed]').forEach(diagram => {
          diagram.removeAttribute('data-processed');
        });
        initMermaid();
      }
    }
  });

  // Observe both html and body for data-theme changes
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}

// Handle view transitions (for Astro View Transitions API)
// This is registered ALWAYS, not just when initial page has diagrams
document.addEventListener('astro:after-swap', () => {
  log('View transition detected');
  // Check if new page has diagrams
  if (hasMermaidDiagrams()) {
    initMermaid();
  }
});

// ===== Fullscreen modal with zoom + pan =====
// One shared modal element is reused for every diagram, and all listeners are
// attached once at script-evaluation time. The script is injected as a module
// and only runs once per full page load, so nothing accumulates across Astro
// view transitions (no per-diagram instances, no duplicated listeners).

const modalState = { svg: null, zoom: 1, panX: 0, panY: 0, dragging: false, sx: 0, sy: 0, spx: 0, spy: 0 };
let modalEl = null;
let modalCloneSeq = 0;

// Magnify icon shown on each rendered diagram.
const TRIGGER_ICON = '<svg width="1rem" height="1rem" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M159.997 116a12 12 0 0 1-12 12h-20v20a12 12 0 0 1-24 0v-20h-20a12 12 0 0 1 0-24h20V84a12 12 0 0 1 24 0v20h20a12 12 0 0 1 12 12Zm72.479 116.482a12 12 0 0 1-16.971 0l-40.679-40.679a96.105 96.105 0 1 1 16.972-16.97l40.678 40.678a12 12 0 0 1 0 16.971ZM115.997 188a72 72 0 1 0-72-72 72.081 72.081 0 0 0 72 72Z" fill="currentColor"/></svg>';

// Add a fullscreen trigger button to a rendered diagram. pre.mermaid is
// position:relative, so the button is absolutely positioned within it.
function addModalTrigger(pre) {
  if (pre.querySelector(':scope > .mermaid-modal-btn')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mermaid-modal-btn';
  btn.setAttribute('aria-label', 'Open diagram in fullscreen');
  btn.innerHTML = TRIGGER_ICON;
  pre.appendChild(btn);
}

// Rewrite every id (and its url(#id) / href="#id" references) within a cloned
// SVG so it can coexist in the DOM with the original without duplicate ids.
function rewriteSvgIds(root) {
  const prefix = 'mmc-' + (modalCloneSeq++) + '-';
  const idEls = root.id ? [root] : [];
  root.querySelectorAll('[id]').forEach(el => idEls.push(el));
  if (idEls.length === 0) return;

  const map = Object.create(null);
  idEls.forEach(el => { map[el.id] = prefix + el.id; });
  idEls.forEach(el => { el.id = map[el.id]; });

  const all = [root];
  root.querySelectorAll('*').forEach(el => all.push(el));
  all.forEach(el => {
    if (!el.attributes) return;
    Array.from(el.attributes).forEach(attr => {
      const orig = attr.value;
      let v = orig.replace(/url\\(#([^)\\s"']+)\\)/g, (m, id) => map[id] ? 'url(#' + map[id] + ')' : m);
      if ((attr.name === 'href' || attr.name === 'xlink:href') && v.charAt(0) === '#' && map[v.slice(1)]) {
        v = '#' + map[v.slice(1)];
      }
      if (v !== orig) attr.value = v;
    });
  });
}

function applyModalTransform() {
  if (!modalState.svg) return;
  const { zoom, panX, panY } = modalState;
  modalState.svg.style.transform = 'scale(' + zoom + ') translate(' + (panX / zoom) + 'px, ' + (panY / zoom) + 'px)';
}

function setupPanZoom(wrapper) {
  const start = (x, y) => {
    modalState.dragging = true;
    modalState.sx = x; modalState.sy = y;
    modalState.spx = modalState.panX; modalState.spy = modalState.panY;
    wrapper.style.cursor = 'grabbing';
  };
  const move = (x, y) => {
    if (!modalState.dragging) return;
    modalState.panX = modalState.spx + (x - modalState.sx);
    modalState.panY = modalState.spy + (y - modalState.sy);
    applyModalTransform();
  };
  const end = () => { modalState.dragging = false; wrapper.style.cursor = 'grab'; };

  wrapper.addEventListener('mousedown', e => start(e.clientX, e.clientY));
  wrapper.addEventListener('mousemove', e => move(e.clientX, e.clientY));
  wrapper.addEventListener('mouseup', end);
  wrapper.addEventListener('mouseleave', end);
  wrapper.addEventListener('touchstart', e => {
    if (e.touches.length === 1) start(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  wrapper.addEventListener('touchmove', e => {
    if (e.touches.length === 1) { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }
  }, { passive: false });
  wrapper.addEventListener('touchend', end);
  wrapper.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    modalState.zoom = Math.max(0.2, Math.min(5, modalState.zoom + delta));
    applyModalTransform();
  }, { passive: false });
}

// Lazily create the single shared modal element (and attach its listeners once).
function ensureModal() {
  if (modalEl) return modalEl;
  const overlay = document.createElement('div');
  overlay.className = 'mermaid-modal-overlay';
  overlay.innerHTML = '<div class="mermaid-modal-content">' +
    '<button type="button" class="mermaid-modal-close" aria-label="Close diagram">' +
    '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>' +
    '</button>' +
    '<div class="mermaid-modal-diagram"><div class="diagram-wrapper"></div></div>' +
    '</div>';
  document.body.appendChild(overlay);
  modalEl = overlay;

  overlay.querySelector('.mermaid-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  setupPanZoom(overlay.querySelector('.diagram-wrapper'));
  return overlay;
}

function openModal(pre) {
  const src = pre.querySelector('svg');
  if (!src) return;
  const overlay = ensureModal();
  const wrapper = overlay.querySelector('.diagram-wrapper');

  modalState.zoom = 1; modalState.panX = 0; modalState.panY = 0; modalState.dragging = false;
  const clone = src.cloneNode(true);
  rewriteSvgIds(clone);
  clone.style.transformOrigin = 'center center';
  clone.style.transform = 'scale(1) translate(0, 0)';
  modalState.svg = clone;

  wrapper.innerHTML = '';
  wrapper.appendChild(clone);
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove('show');
  document.body.style.overflow = '';
  const wrapper = modalEl.querySelector('.diagram-wrapper');
  if (wrapper) wrapper.innerHTML = '';
  modalState.svg = null;
}

// Open the modal via event delegation so a single listener covers every
// current and future diagram (no per-diagram binding).
document.addEventListener('click', e => {
  const btn = e.target.closest && e.target.closest('.mermaid-modal-btn');
  if (!btn) return;
  const pre = btn.closest('pre.mermaid');
  if (pre) openModal(pre);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalEl && modalEl.classList.contains('show')) closeModal();
});
`;

        injectScript('page', mermaidScriptContent);

        // Add CSS to the page with layout shift prevention
        injectScript('page', `
          // Add CSS for mermaid diagrams
          const style = document.createElement('style');
          style.textContent = \`
            /* Prevent layout shifts by setting minimum height */
            pre.mermaid {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 2rem 0;
              padding: 1rem;
              background-color: transparent;
              border: none;
              overflow: auto;
              min-height: 200px; /* Prevent layout shift */
              position: relative;
            }
            
            /* Loading state with skeleton loader */
            pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
            }
            
            /* Dark mode skeleton loader */
            [data-theme="dark"] pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
              background-size: 200% 100%;
            }
            
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
            
            /* Show processed diagrams with smooth transition */
            pre.mermaid[data-processed] {
              animation: none;
              background: transparent;
              min-height: auto; /* Allow natural height after render */
            }
            
            /* Ensure responsive sizing for mermaid SVGs */
            pre.mermaid svg {
              max-width: 100%;
              height: auto;
            }
            
            /* Optional: Add subtle background for better visibility */
            @media (prefers-color-scheme: dark) {
              pre.mermaid[data-processed] {
                background-color: rgba(255, 255, 255, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            @media (prefers-color-scheme: light) {
              pre.mermaid[data-processed] {
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            /* Respect user's color scheme preference */
            [data-theme="dark"] pre.mermaid[data-processed] {
              background-color: rgba(255, 255, 255, 0.02);
              border-radius: 0.5rem;
            }
            
            [data-theme="light"] pre.mermaid[data-processed] {
              background-color: rgba(0, 0, 0, 0.02);
              border-radius: 0.5rem;
            }

            /* ===== Fullscreen modal (zoom + pan) ===== */
            /* The modal matches the host page's theme by reading the page's own
               CSS variables: Starlight's --sl-color-* first, then common custom
               theme vars (--bg-primary / --text-primary / --border / --shadow).
               When neither exists, the OS-preference fallbacks below apply. The
               mapping is declared on the consuming elements (not :root) so that
               page themes toggled on <body> resolve to the right value. */
            :root {
              --mm-bg-fallback: #ffffff;
              --mm-fg-fallback: #1f2937;
              --mm-border-fallback: rgba(0, 0, 0, 0.12);
              --mm-shadow-fallback: rgba(0, 0, 0, 0.25);
            }
            @media (prefers-color-scheme: dark) {
              :root {
                --mm-bg-fallback: #1e1e1e;
                --mm-fg-fallback: #e5e7eb;
                --mm-border-fallback: rgba(255, 255, 255, 0.15);
                --mm-shadow-fallback: rgba(0, 0, 0, 0.6);
              }
            }
            .mermaid-modal-overlay,
            pre.mermaid > .mermaid-modal-btn {
              --mm-bg: var(--sl-color-bg, var(--bg-primary, var(--mm-bg-fallback)));
              --mm-fg: var(--sl-color-text, var(--text-primary, var(--mm-fg-fallback)));
              --mm-border: var(--sl-color-gray-5, var(--border, var(--mm-border-fallback)));
              --mm-shadow: var(--sl-color-shadow, var(--shadow, var(--mm-shadow-fallback)));
            }

            pre.mermaid > .mermaid-modal-btn {
              position: absolute;
              top: 0.5rem;
              right: 0.5rem;
              z-index: 5;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0.3rem;
              border-radius: 0.5rem;
              cursor: pointer;
              color: var(--mm-fg);
              background: var(--mm-bg);
              border: 1px solid var(--mm-border);
              box-shadow: 0 1px 2px var(--mm-shadow);
              opacity: 0;
              transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
            }
            pre.mermaid:hover > .mermaid-modal-btn,
            pre.mermaid > .mermaid-modal-btn:focus-visible {
              opacity: 0.85;
            }
            pre.mermaid > .mermaid-modal-btn:hover {
              opacity: 1;
              transform: translateY(-1px);
            }
            /* Always show the trigger on touch devices (no hover) */
            @media (hover: none) {
              pre.mermaid > .mermaid-modal-btn { opacity: 0.7; }
            }

            .mermaid-modal-overlay {
              position: fixed;
              inset: 0;
              z-index: 99999;
              display: none;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: rgba(0, 0, 0, 0.6);
              opacity: 0;
              transition: opacity 0.25s ease;
            }
            .mermaid-modal-overlay.show {
              display: flex;
              opacity: 1;
            }

            .mermaid-modal-content {
              position: relative;
              display: flex;
              flex-direction: column;
              width: min(1200px, 92vw);
              height: min(85vh, 900px);
              background: var(--mm-bg);
              color: var(--mm-fg);
              border: 1px solid var(--mm-border);
              border-radius: 0.75rem;
              box-shadow: 0 8px 32px var(--mm-shadow);
              transform: scale(0.96);
              transition: transform 0.25s ease;
            }
            .mermaid-modal-overlay.show .mermaid-modal-content {
              transform: scale(1);
            }

            .mermaid-modal-close {
              position: absolute;
              top: 0.75rem;
              right: 0.75rem;
              z-index: 2;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0.25rem;
              cursor: pointer;
              color: var(--mm-fg);
              background: var(--mm-bg);
              border: 1px solid var(--mm-border);
              border-radius: 0.5rem;
              box-shadow: 0 1px 2px var(--mm-shadow);
              transition: transform 0.2s ease;
            }
            .mermaid-modal-close:hover {
              transform: translateY(-1px);
            }

            .mermaid-modal-diagram {
              flex: 1;
              min-height: 0;
              padding: 1.5rem;
            }
            .diagram-wrapper {
              width: 100%;
              height: 100%;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: grab;
              user-select: none;
              touch-action: none;
            }
            .diagram-wrapper:active {
              cursor: grabbing;
            }
            .diagram-wrapper svg {
              max-width: 100%;
              max-height: 100%;
              width: auto;
              height: auto;
              transform-origin: center center;
            }

            @media (prefers-reduced-motion: reduce) {
              .mermaid-modal-overlay,
              .mermaid-modal-content,
              .mermaid-modal-close,
              pre.mermaid > .mermaid-modal-btn {
                transition: none;
              }
            }
            @media (max-width: 768px) {
              .mermaid-modal-overlay { padding: 1rem; }
              .mermaid-modal-content {
                width: 100%;
                height: 100%;
                border-radius: 0;
              }
            }
          \`;
          document.head.appendChild(style);
        `);
      }
    }
  };
}
