import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Rehype plugin to transform mermaid code blocks
 * Converts ```mermaid code blocks to <pre class="mermaid">
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
          
          // Transform to <pre class="mermaid">
          node.properties = {
            ...node.properties,
            className: ['mermaid']
          };
          
          node.children = [{
            type: 'text',
            value: diagramContent
          }];
          
          if (options.logger) {
            options.logger.info(`Transformed mermaid block #${mermaidCount} in ${file.path || 'unknown file'}`);
          }
        }
      }
    });
    
    if (mermaidCount > 0 && options.logger) {
      options.logger.info(`Total mermaid blocks transformed: ${mermaidCount}`);
    }
  };
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
    mermaidConfig = {}
  } = options;

  return {
    name: 'astro-mermaid',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig, addWatchFile, injectScript, logger, command }) => {
        logger.info('Setting up Mermaid integration');

        // Log existing rehype plugins
        logger.info('Existing rehype plugins:', config.markdown?.rehypePlugins?.length || 0);

        // Update markdown config to use our rehype plugin
        updateConfig({
          markdown: {
            rehypePlugins: [
              ...(config.markdown?.rehypePlugins || []),
              [rehypeMermaidPlugin, { logger }]
            ]
          },
          vite: {
            optimizeDeps: {
              include: ['mermaid']
            }
          }
        });

        // Inject client-side mermaid script
        const mermaidScriptContent = `
import mermaid from 'mermaid';

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
    console.log('[astro-mermaid] No mermaid diagrams found. Looking for code blocks...');
    const codeBlocks = document.querySelectorAll('pre code.language-mermaid');
    console.log('[astro-mermaid] Found', codeBlocks.length, 'mermaid code blocks');
    return;
  }
  
  // Get current theme
  let currentTheme = defaultConfig.theme;
  
  if (${autoTheme}) {
    const dataTheme = document.documentElement.getAttribute('data-theme');
    currentTheme = themeMap[dataTheme] || defaultConfig.theme;
    console.log('[astro-mermaid] Using theme:', currentTheme);
  }
  
  // Configure mermaid
  mermaid.initialize({
    ...defaultConfig,
    theme: currentTheme
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
      const { svg } = await mermaid.render(id, diagramDefinition);
      diagram.innerHTML = svg;
      diagram.setAttribute('data-processed', 'true');
      console.log('[astro-mermaid] Successfully rendered diagram:', id);
    } catch (error) {
      console.error('[astro-mermaid] Mermaid rendering error:', error);
      diagram.innerHTML = '<div style="color: red;">Error rendering diagram</div>';
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMermaid);
} else {
  initMermaid();
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
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}

// Handle view transitions (for Astro View Transitions API)
document.addEventListener('astro:after-swap', initMermaid);
`;

        injectScript('page', mermaidScriptContent);

        // Add CSS to the page
        injectScript('page', `
          // Add CSS for mermaid diagrams
          const style = document.createElement('style');
          style.textContent = \`
            /* Hide diagrams until processed to prevent flash of unstyled content */
            pre.mermaid:not([data-processed]) {
              opacity: 0;
              transition: opacity 0.3s ease-in-out;
            }
            
            /* Show processed diagrams */
            pre.mermaid[data-processed] {
              opacity: 1;
            }
            
            /* Center mermaid diagrams and add spacing */
            pre.mermaid {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 2rem 0;
              padding: 1rem;
              background-color: transparent;
              border: none;
              overflow: auto;
            }
            
            /* Ensure responsive sizing for mermaid SVGs */
            pre.mermaid svg {
              max-width: 100%;
              height: auto;
            }
            
            /* Optional: Add subtle background for better visibility */
            @media (prefers-color-scheme: dark) {
              pre.mermaid {
                background-color: rgba(255, 255, 255, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            @media (prefers-color-scheme: light) {
              pre.mermaid {
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 0.5rem;
              }
            }
          \`;
          document.head.appendChild(style);
        `);
      }
    }
  };
}