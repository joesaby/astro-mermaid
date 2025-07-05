/**
 * Astro Mermaid Zoom Addon
 * A clean, lightweight zoom solution for mermaid diagrams
 * Can be used alongside the existing astro-mermaid integration
 */

export default function mermaidZoomAddon(options = {}) {
  const {
    zoomOnClick = true,
    showCloseButton = true,
    backdropOpacity = 0.9,
    animationDuration = 300,
    enableKeyboardClose = true
  } = options;

  return {
    name: 'astro-mermaid-zoom-addon',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        // Inject zoom functionality after mermaid renders
        injectScript('page', `
          // Mermaid Zoom Addon
          document.addEventListener('DOMContentLoaded', () => {
            // Wait for mermaid diagrams to be processed
            const initZoom = () => {
              const mermaidElements = document.querySelectorAll('pre.mermaid[data-processed] svg');
              
              if (mermaidElements.length === 0) {
                // Retry after a short delay if diagrams aren't ready yet
                setTimeout(initZoom, 100);
                return;
              }
              
              console.log('[mermaid-zoom] Initializing zoom for', mermaidElements.length, 'diagrams');
              
              mermaidElements.forEach((svg, index) => {
                // Skip if already has zoom to avoid duplicates
                if (svg.hasAttribute('data-zoom-enabled')) return;
                
                svg.setAttribute('data-zoom-enabled', 'true');
                svg.style.cursor = 'zoom-in';
                svg.setAttribute('tabindex', '0');
                svg.setAttribute('role', 'button');
                svg.setAttribute('aria-label', 'Click to zoom diagram');
                
                // Add click handler
                if (${zoomOnClick}) {
                  svg.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openZoom(svg);
                  });
                  
                  // Add keyboard support
                  if (${enableKeyboardClose}) {
                    svg.addEventListener('keydown', (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openZoom(svg);
                      }
                    });
                  }
                }
              });
            };
            
            // Initialize zoom
            initZoom();
            
            // Re-initialize on astro page transitions
            document.addEventListener('astro:after-swap', initZoom);
            
            // Re-initialize on theme changes only
            const themeObserver = new MutationObserver((mutations) => {
              for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                  console.log('[mermaid-zoom] Theme changed, re-initializing zoom...');
                  // Wait a bit for mermaid to finish re-rendering
                  setTimeout(initZoom, 500);
                  break;
                }
              }
            });
            
            themeObserver.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['data-theme']
            });
          });
          
          // Zoom functionality
          let currentZoom = null;
          
          function openZoom(svg) {
            if (currentZoom) return; // Prevent multiple overlays
            
            // Clone the SVG for the zoom view
            const svgClone = svg.cloneNode(true);
            svgClone.style.cursor = 'zoom-out';
            
            // For mermaid SVGs, we need to set explicit dimensions based on viewBox
            const viewBox = svgClone.getAttribute('viewBox');
            if (viewBox) {
              const [, , width, height] = viewBox.split(' ').map(Number);
              // Scale to fit screen while maintaining aspect ratio
              const maxWidth = window.innerWidth * 0.9;
              const maxHeight = window.innerHeight * 0.8;
              const scale = Math.min(maxWidth / width, maxHeight / height, 2); // Max 2x zoom
              
              svgClone.style.width = (width * scale) + 'px';
              svgClone.style.height = (height * scale) + 'px';
            } else {
              svgClone.style.maxWidth = '90vw';
              svgClone.style.maxHeight = '80vh';
            }
            
            svgClone.removeAttribute('data-zoom-enabled');
            
            // Create zoom overlay
            const overlay = document.createElement('div');
            overlay.className = 'mermaid-zoom-overlay';
            overlay.style.cssText = \`
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, ${backdropOpacity});
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 1000;
              cursor: zoom-out;
              opacity: 0;
              transition: opacity ${animationDuration}ms ease;
            \`;
            
            // Create content container
            const content = document.createElement('div');
            content.className = 'mermaid-zoom-content';
            content.style.cssText = \`
              position: relative;
              max-width: 95vw;
              max-height: 95vh;
              overflow: visible;
              background: var(--sl-color-bg, white);
              border-radius: 8px;
              padding: 2rem;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
              transform: scale(0.8);
              transition: transform ${animationDuration}ms ease;
              display: flex;
              justify-content: center;
              align-items: center;
            \`;
            
            // Add close button if enabled
            if (${showCloseButton}) {
              const closeButton = document.createElement('button');
              closeButton.innerHTML = '&times;';
              closeButton.className = 'mermaid-zoom-close';
              closeButton.setAttribute('aria-label', 'Close zoom view');
              closeButton.style.cssText = \`
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: none;
                border: none;
                font-size: 2rem;
                font-weight: bold;
                cursor: pointer;
                color: var(--sl-color-text, #333);
                z-index: 1001;
                width: 3rem;
                height: 3rem;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s ease;
              \`;
              
              closeButton.addEventListener('mouseenter', () => {
                closeButton.style.backgroundColor = 'var(--sl-color-gray-5, rgba(0,0,0,0.1))';
              });
              
              closeButton.addEventListener('mouseleave', () => {
                closeButton.style.backgroundColor = 'transparent';
              });
              
              closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                closeZoom();
              });
              
              content.appendChild(closeButton);
            }
            
            // Add the SVG to content
            console.log('[mermaid-zoom] SVG viewBox:', svgClone.getAttribute('viewBox'));
            console.log('[mermaid-zoom] SVG computed size:', svgClone.style.width, 'x', svgClone.style.height);
            content.appendChild(svgClone);
            overlay.appendChild(content);
            
            // Add click-outside-to-close
            overlay.addEventListener('click', (e) => {
              if (e.target === overlay) {
                closeZoom();
              }
            });
            
            // Add keyboard support
            if (${enableKeyboardClose}) {
              const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                  closeZoom();
                }
              };
              document.addEventListener('keydown', handleKeyDown);
              overlay._keyHandler = handleKeyDown;
            }
            
            // Add to DOM and animate in
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            currentZoom = overlay;
            
            // Trigger animation
            requestAnimationFrame(() => {
              overlay.style.opacity = '1';
              content.style.transform = 'scale(1)';
            });
          }
          
          function closeZoom() {
            if (!currentZoom) return;
            
            const overlay = currentZoom;
            const content = overlay.querySelector('.mermaid-zoom-content');
            
            // Animate out
            overlay.style.opacity = '0';
            if (content) {
              content.style.transform = 'scale(0.8)';
            }
            
            // Remove after animation
            setTimeout(() => {
              if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
              }
              document.body.style.overflow = '';
              
              // Remove keyboard handler
              if (overlay._keyHandler) {
                document.removeEventListener('keydown', overlay._keyHandler);
              }
              
              currentZoom = null;
            }, ${animationDuration});
          }
        `);

        // Add CSS for zoom enhancements
        injectScript('page', `
          const zoomStyle = document.createElement('style');
          zoomStyle.textContent = \`
            /* Enhance mermaid diagrams for zoom */
            pre.mermaid[data-processed] svg[data-zoom-enabled] {
              transition: transform 0.2s ease, box-shadow 0.2s ease;
              border-radius: 4px;
            }
            
            pre.mermaid[data-processed] svg[data-zoom-enabled]:hover {
              transform: scale(1.02);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            pre.mermaid[data-processed] svg[data-zoom-enabled]:focus {
              outline: 2px solid var(--sl-color-accent, #0087d7);
              outline-offset: 2px;
            }
            
            /* Zoom overlay responsive adjustments */
            @media (max-width: 768px) {
              .mermaid-zoom-content {
                padding: 1rem !important;
                max-width: 98vw !important;
                max-height: 98vh !important;
              }
              
              .mermaid-zoom-close {
                top: 0.25rem !important;
                right: 0.25rem !important;
                font-size: 1.5rem !important;
                width: 2.5rem !important;
                height: 2.5rem !important;
              }
            }
            
            /* Dark theme support */
            @media (prefers-color-scheme: dark) {
              .mermaid-zoom-content {
                background: var(--sl-color-bg, #1a1a1a) !important;
                color: var(--sl-color-text, white) !important;
              }
            }
            
            [data-theme="dark"] .mermaid-zoom-content {
              background: var(--sl-color-bg, #1a1a1a) !important;
              color: var(--sl-color-text, white) !important;
            }
          \`;
          document.head.appendChild(zoomStyle);
        `);
      }
    }
  };
}