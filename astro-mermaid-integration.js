import { resolve } from 'import-meta-resolve';

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

        // Generate unique modal ID
        const modalId = `mermaid-modal-${mermaidCount}-${Math.random().toString(36).substr(2, 9)}`;

        // Add modal HTML
        const modalHtml = `<div id="${modalId}" class="mermaid-modal-overlay" hidden>
  <div class="mermaid-modal-content">
    <div class="mermaid-modal-header">
      <button class="mermaid-modal-close" aria-label="Close modal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>
    <div class="mermaid-modal-diagram">
      <div class="diagram-wrapper">
        <!-- Diagram content will be cloned here by JavaScript -->
      </div>
    </div>
  </div>
</div>`;

        // Transform to html node with pre.mermaid, modal trigger, and modal
        const htmlNode = {
          type: 'html',
          value: `<div style="position: relative;">
  <pre class="mermaid">${node.value}</pre>
  <div class="mermaid-modal-trigger" data-modal-id="${modalId}" style="position: absolute; top: 0.5rem; right: 0.5rem;">
    <button class="mermaid-modal-btn" aria-label="Open diagram in modal">
      <svg width="1rem" height="1rem" viewBox="0 0 256.00098 256.00098" id="Flat" xmlns="http://www.w3.org/2000/svg">
  <path d="M159.99707,116a12.00028,12.00028,0,0,1-12,12h-20v20a12,12,0,0,1-24,0V128h-20a12,12,0,0,1,0-24h20V84a12,12,0,0,1,24,0v20h20A12.00028,12.00028,0,0,1,159.99707,116Zm72.47949,116.48242a12.00033,12.00033,0,0,1-16.9707,0l-40.67871-40.67871a96.10513,96.10513,0,1,1,16.97168-16.96979l40.67773,40.6778A11.99973,11.99973,0,0,1,232.47656,232.48242ZM115.99707,187.99609a72,72,0,1,0-72-72A72.08124,72.08124,0,0,0,115.99707,187.99609Z"/>
</svg>
    </button>
  </div>
</div>
${modalHtml}`
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
 * Rehype plugin to transform mermaid code blocks
 * Converts ```mermaid code blocks to <pre class="mermaid"> with modal support
 */
function rehypeMermaidPlugin(options = {}) {
  return async function transformer(tree, file) {
    const { visit } = await import('unist-util-visit');
    const { toString } = await import('mdast-util-to-string');

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
          // Get the mermaid diagram content
          const diagramContent = toString(codeNode);

          // Generate unique modal ID
          const modalId = `mermaid-modal-${mermaidCount}-${Math.random().toString(36).substr(2, 9)}`;

          // Create wrapper HTML with positioned trigger
          const wrapperHtml = `<div style="position: relative;">
  <pre class="mermaid">${diagramContent}</pre>
  <div class="mermaid-modal-trigger" data-modal-id="${modalId}" style="position: absolute; top: 0.5rem; right: 0.5rem;">
    <button class="mermaid-modal-btn" aria-label="Open diagram in modal">
      <svg width="1rem" height="1rem" viewBox="0 0 256.00098 256.00098" id="Flat" xmlns="http://www.w3.org/2000/svg">
  <path d="M159.99707,116a12.00028,12.00028,0,0,1-12,12h-20v20a12,12,0,0,1-24,0V128h-20a12,12,0,0,1,0-24h20V84a12,12,0,0,1,24,0v20h20A12.00028,12.00028,0,0,1,159.99707,116Zm72.47949,116.48242a12.00033,12.00033,0,0,1-16.9707,0l-40.67871-40.67871a96.10513,96.10513,0,1,1,16.97168-16.96979l40.67773,40.6778A11.99973,11.99973,0,0,1,232.47656,232.48242ZM115.99707,187.99609a72,72,0,1,0-72-72A72.08124,72.08124,0,0,0,115.99707,187.99609Z"/>
</svg>
    </button>
  </div>
</div>`;

          // Add modal HTML
          const modalHtml = `
<div id="${modalId}" class="mermaid-modal-overlay" hidden>
  <div class="mermaid-modal-content">
    <div class="mermaid-modal-header">
      <button class="mermaid-modal-close" aria-label="Close modal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>
    <div class="mermaid-modal-diagram">
      <div class="diagram-wrapper">
        <!-- Diagram content will be cloned here by JavaScript -->
      </div>
    </div>
  </div>
</div>`;

          // Replace the pre node with the wrapper and add modal after
          if (parent && typeof index === 'number') {
            parent.children[index] = {
              type: 'html',
              value: wrapperHtml
            };
            parent.children.splice(index + 1, 0, {
              type: 'html',
              value: modalHtml
            });
          }

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
 * @returns {import('astro').AstroIntegration}
 */
export default function astroMermaid(options = {}) {
  const {
    theme = 'default',
    autoTheme = true,
    mermaidConfig = {},
    iconPacks = []
  } = options;

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

        // Update markdown config to use both remark and rehype plugins
        updateConfig({
          markdown: {
            remarkPlugins: [
              ...(config.markdown?.remarkPlugins || []),
              [remarkMermaidPlugin, { logger }]
            ],
            rehypePlugins: [
              ...(config.markdown?.rehypePlugins || []),
              [rehypeMermaidPlugin, { logger }]
            ]
          },
          vite: {
            optimizeDeps: {
              include: viteOptimizeDepsInclude
            }
          }
        });

        // Serialize icon packs for client-side use
        const iconPacksConfig = iconPacks.map(pack => ({
          name: pack.name,
          loader: pack.loader.toString()
        }));

        // Inject client-side mermaid script with conditional loading
        const mermaidScriptContent = `
// Check if page has mermaid diagrams
const hasMermaidDiagrams = () => {
  return document.querySelectorAll('pre.mermaid').length > 0;
};

// Only proceed if there are mermaid diagrams on the page
if (hasMermaidDiagrams()) {
  console.log('[astro-mermaid] Mermaid diagrams detected, loading mermaid.js...');
  
  // Dynamically import mermaid only when needed
  import('mermaid').then(async ({ default: mermaid }) => {
    // Register icon packs if provided
    const iconPacks = ${JSON.stringify(iconPacksConfig)};
    if (iconPacks && iconPacks.length > 0) {
      console.log('[astro-mermaid] Registering', iconPacks.length, 'icon packs');
      const packs = iconPacks.map(pack => ({
        name: pack.name,
        loader: new Function('return ' + pack.loader)()
      }));
      await mermaid.registerIconPacks(packs);
    }

    // Register ELK layouts if the optional peer is available at build-time
    ${useElk ? `
const elkModule = await import("@mermaid-js/layout-elk").catch(() => null);
if (elkModule?.default) {
  console.log("[astro-mermaid] Registering elk layouts");
  mermaid.registerLayoutLoaders(elkModule.default);
}
` : ``}

    // Mermaid configuration
    const defaultConfig = ${JSON.stringify({
      startOnLoad: false,
      theme: theme,
      ...mermaidConfig
    })};

    // Theme mapping for auto-theme switching
    const themeMap = {
      'light': 'default',
      'dark': 'dark'
    };

    // Initialize all mermaid diagrams
    async function initMermaid() {
      console.log('[astro-mermaid] Initializing mermaid diagrams...');
      const diagrams = document.querySelectorAll('pre.mermaid');
      
      console.log('[astro-mermaid] Found', diagrams.length, 'mermaid diagrams');
      
      if (diagrams.length === 0) {
        return;
      }
      
      // Get current theme from multiple sources
      let currentTheme = defaultConfig.theme;
      
      if (${autoTheme}) {
        // Check both html and body for data-theme attribute
        const htmlTheme = document.documentElement.getAttribute('data-theme');
        const bodyTheme = document.body.getAttribute('data-theme');
        const dataTheme = htmlTheme || bodyTheme;
        currentTheme = themeMap[dataTheme] || defaultConfig.theme;
        console.log('[astro-mermaid] Using theme:', currentTheme, 'from', htmlTheme ? 'html' : 'body');
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
        
        console.log('[astro-mermaid] Rendering diagram:', id);
        
        try {
          // Clear any existing error state
          const existingGraph = document.getElementById(id);
          if (existingGraph) {
            existingGraph.remove();
          }
          
          const { svg } = await mermaid.render(id, diagramDefinition);
          diagram.innerHTML = svg;
          diagram.setAttribute('data-processed', 'true');
          console.log('[astro-mermaid] Successfully rendered diagram:', id);
        } catch (error) {
          console.error('[astro-mermaid] Mermaid rendering error for diagram:', id, error);
          diagram.innerHTML = \`<div style="color: red; padding: 1rem; border: 1px solid red; border-radius: 0.5rem;">
            <strong>Error rendering diagram:</strong><br/>
            \${error.message || 'Unknown error'}
          </div>\`;
          diagram.setAttribute('data-processed', 'true');
        }
      }
    }

    // Initialize immediately since DOM is ready
    initMermaid();

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
    document.addEventListener('astro:after-swap', () => {
      // Check again if new page has diagrams
      if (hasMermaidDiagrams()) {
        initMermaid();
      }
    });
  }).catch(error => {
    console.error('[astro-mermaid] Failed to load mermaid:', error);
  });
} else {
  console.log('[astro-mermaid] No mermaid diagrams found on this page, skipping mermaid.js load');
}
`;

        injectScript('page', mermaidScriptContent);

        // Add CSS to the page with layout shift prevention and modal styles
        injectScript('page', `
          // Add CSS for mermaid diagrams and modals
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

            /* Modal styles */
            .mermaid-modal-trigger {
              margin-top: 0;
              position: absolute;
              top: 0.5rem;
              right: 0.5rem;
              display: inline-block;
              z-index: 10;
            }
            .mermaid-modal-btn {
              background: var(--sl-color-bg);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid var(--sl-color-border);
              border-radius: 1.75rem;
              padding: 0.3rem;
              cursor: pointer;
              fill: var(--sl-color-bg-accent);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              opacity: 0.7;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 2px var(--sl-color-shadow);
            }

            .mermaid-modal-btn:hover {
              opacity: 1;
              background: var(--sl-color-bg-accent);
              fill: var(--sl-color-bg);
              color: var(--sl-color-bg);
              box-shadow: 0 2px 8px var(--sl-color-shadow);
              transform: translateY(-1px);
            }

            .mermaid-modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0, 0, 0, 0.6);
              backdrop-filter: blur(40px);
              -webkit-backdrop-filter: blur(40px);
              z-index: 99999;
              display: none;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              opacity: 0;
              visibility: hidden;
              transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .mermaid-modal-overlay.show {
              display: flex !important;
              opacity: 1 !important;
              visibility: visible !important;
            }

            .mermaid-modal-overlay.show .mermaid-modal-content {
              transform: scale(1) !important;
            }

            .mermaid-modal-content {
              background: var(--sl-color-bg);
              backdrop-filter: blur(40px);
              -webkit-backdrop-filter: blur(40px);
              border: 1px solid var(--sl-color-border);
              border-radius: 1rem;
              max-width: calc(100vw - 320px - 4rem);    
              height: 85dvh;
              width: 100%;
              margin-top: 2rem;
              margin-left: auto;
              margin-right: 0;
              display: flex;
              flex-direction: column;
              box-shadow: 0 8px 32px var(--sl-color-shadow), 0 0 0 1px var(--sl-color-border);
              transform: scale(0.95);
              transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .mermaid-modal-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid var(--sl-color-border);
              background: var(--sl-color-bg);
              color: var(--sl-color-bg-accent);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
            }

            .mermaid-modal-header h3 {
              margin: 0;
              font-size: 1.125rem;
              font-weight: 600;
              color: var(--sl-color-text);
            }

            .mermaid-modal-close {
              background: var(--sl-color-bg);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid var(--sl-color-border);
              cursor: pointer;
              color: var(--sl-color-bg-accent);
              border-radius: 0.75rem;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 1px 2px var(--sl-color-shadow);
              position: fixed;
              right: 1rem;
              top: 1rem;
              z-index: 10001;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .mermaid-modal-close:hover {
              background: var(--sl-color-bg-accent);
              color: var(--sl-color-bg);
              border-color: var(--sl-color-border);
              box-shadow: 0 2px 8px var(--sl-color-shadow);
              transform: translateY(-1px);
            }


            .mermaid-modal-diagram {
              flex: 1;
              overflow: hidden;
              margin-top: 0;
              background: var(--sl-color-bg);
              border-radius: 0.5rem;
            }

            .diagram-wrapper {
              width: 100%;
              height: 100%;
              overflow: hidden;
              cursor: grab;
              user-select: none;
              border-radius: 0.75rem;
              background: var(--sl-color-bg);
              border: 1px solid var(--sl-color-border);
              box-shadow: 0 2px 8px var(--sl-color-shadow);
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .diagram-wrapper:active {
              cursor: grabbing;
            }

            .diagram-wrapper svg {
              max-width: none;
              width: auto;
              height: auto;
              max-width: 100%;
              max-height: 100%;
              transform-origin: center center;
              transition: transform 0.1s ease;
            }

            /* Dark mode adjustments */
            @media (prefers-color-scheme: dark) {
              .mermaid-modal-overlay {
                background: rgba(0, 0, 0, 0.7);
              }
            }

            /* Reduced motion preferences */
            @media (prefers-reduced-motion: reduce) {
              .mermaid-modal-overlay,
              .mermaid-modal-content,
              .mermaid-modal-btn,
              .control-btn,
              .mermaid-modal-close {
                transition: none;
              }
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
              .mermaid-modal-overlay {
                left: 0;
                width: 100vw;
                padding: 1rem;
              }

              .mermaid-modal-content {
                max-width: 100vw;
                max-height: 100vh;
                margin-left: 0;
                border-radius: 0;
              }

            }
          \`;
          document.head.appendChild(style);
        `);

        // Inject modal JavaScript
        injectScript('page', `
          // Mermaid Modal JavaScript
          class MermaidModal {
            constructor(container) {
              this.modalId = container.dataset.modalId;
              this.modal = document.getElementById(this.modalId);
              if (!this.modal) {
                console.error('Modal not found:', this.modalId);
                return;
              }
              this.diagramWrapper = this.modal.querySelector('.diagram-wrapper');

              this.svgElement = null;
              this.zoomLevel = 1;
              this.panX = 0;
              this.panY = 0;
              this.isDragging = false;
              this.startX = 0;
              this.startY = 0;
              this.startPanX = 0;
              this.startPanY = 0;

              this.init();
            }

            init() {
              const openBtn = document.querySelector(\`[data-modal-id="\${this.modalId}"] .mermaid-modal-btn\`);
              const closeBtn = this.modal.querySelector('.mermaid-modal-close');

              openBtn.addEventListener('click', () => this.open());
              closeBtn.addEventListener('click', () => this.close());

              this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.close();
              });

              document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.modal.hidden) this.close();
              });

              this.setupPanAndZoom();
            }

            open() {
              this.modal.classList.add('show');
              document.body.style.overflow = 'hidden';

              // Hide Starlight sidebars when modal is open
              const sidebar = document.querySelector('.starlight__sidebar');
              const rightSidebar = document.querySelector('.right-sidebar-container');

              if (sidebar) {
                sidebar.style.visibility = 'hidden';
                sidebar.style.opacity = '0';
              }
              if (rightSidebar) {
                rightSidebar.style.visibility = 'hidden';
                rightSidebar.style.opacity = '0';
              }

              // Wait for modal to be visible, then find and clone the SVG
              setTimeout(() => {
                this.cloneDiagram();
              }, 10);
            }

            close() {
              this.modal.classList.remove('show');
              document.body.style.overflow = '';

              // Restore Starlight sidebars when modal is closed
              const sidebar = document.querySelector('.starlight__sidebar');
              const rightSidebar = document.querySelector('.right-sidebar-container');

              if (sidebar) {
                sidebar.style.visibility = '';
                sidebar.style.opacity = '';
              }
              if (rightSidebar) {
                rightSidebar.style.visibility = '';
                rightSidebar.style.opacity = '';
              }
            }

            cloneDiagram() {
              // Find the mermaid diagram that comes before the trigger button
              const trigger = document.querySelector(\`[data-modal-id="\${this.modalId}"]\`);
              const mermaidContainer = trigger?.previousElementSibling;

              if (mermaidContainer && mermaidContainer.classList.contains('mermaid')) {
                const originalSvg = mermaidContainer.querySelector('svg');

                if (originalSvg) {
                  // Clear existing content
                  this.diagramWrapper.innerHTML = '';

                  // Clone the SVG
                  this.svgElement = originalSvg.cloneNode(true);
                  this.diagramWrapper.appendChild(this.svgElement);

                  // Reset transform
                  this.svgElement.style.transform = 'scale(1) translate(0, 0)';
                  this.svgElement.style.transformOrigin = 'center center';

                } else {
                  console.log('[astro-mermaid] No SVG found in mermaid container');
                }
              } else {
                console.log('[astro-mermaid] No mermaid container found');
              }
            }

            setupPanAndZoom() {
              // Use passive listeners for better performance
              this.diagramWrapper.addEventListener('mousedown', (e) => {
                this.startDrag(e);
              }, { passive: true });

              this.diagramWrapper.addEventListener('mousemove', (e) => {
                this.drag(e);
              }, { passive: true });

              this.diagramWrapper.addEventListener('mouseup', () => {
                this.endDrag();
              }, { passive: true });

              this.diagramWrapper.addEventListener('mouseleave', () => {
                this.endDrag();
              }, { passive: true });

              // Touch events for mobile
              this.diagramWrapper.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                  e.preventDefault();
                  const touch = e.touches[0];
                  this.startDrag(touch);
                }
              }, { passive: false });

              this.diagramWrapper.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1) {
                  e.preventDefault();
                  const touch = e.touches[0];
                  this.drag(touch);
                }
              }, { passive: false });

              this.diagramWrapper.addEventListener('touchend', () => {
                this.endDrag();
              }, { passive: true });

              // Wheel zoom with better handling
              this.diagramWrapper.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.zoom(delta);
              }, { passive: false });
            }

            startDrag(e) {
              this.isDragging = true;
              this.startX = e.clientX;
              this.startY = e.clientY;
              this.startPanX = this.panX;
              this.startPanY = this.panY;
              this.diagramWrapper.style.cursor = 'grabbing';
              // Prevent text selection during drag
              document.body.style.userSelect = 'none';
            }

            drag(e) {
              if (!this.isDragging) return;

              const deltaX = e.clientX - this.startX;
              const deltaY = e.clientY - this.startY;

              this.panX = this.startPanX + deltaX;
              this.panY = this.startPanY + deltaY;

              this.updateTransform();
            }

            endDrag() {
              this.isDragging = false;
              this.diagramWrapper.style.cursor = 'grab';
              // Restore text selection
              document.body.style.userSelect = '';
            }

            /**
             * Apply zoom transformation
             */
            zoom(delta) {
              const newZoom = Math.max(0.1, Math.min(3, this.zoomLevel + delta));
              if (newZoom !== this.zoomLevel) {
                this.zoomLevel = newZoom;
                this.updateTransform();
              }
            }

            updateTransform() {
              if (this.svgElement) {
                // Use requestAnimationFrame for smoother updates
                requestAnimationFrame(() => {
                  this.svgElement.style.transform = \`scale(\${this.zoomLevel}) translate(\${this.panX / this.zoomLevel}px, \${this.panY / this.zoomLevel}px)\`;
                });
              }
            }
          }

          // Initialize all mermaid modals when DOM is loaded
          document.addEventListener('DOMContentLoaded', () => {
            const containers = document.querySelectorAll('.mermaid-modal-trigger');
            containers.forEach(container => {
              new MermaidModal(container);
            });
          });

          // Also initialize on Astro page transitions
          document.addEventListener('astro:page-load', () => {
            const containers = document.querySelectorAll('.mermaid-modal-trigger');
            containers.forEach(container => {
              new MermaidModal(container);
            });
          });
        `);
      }
    }
  };
}