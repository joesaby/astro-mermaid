import type { AstroIntegration } from 'astro';
import type { Mermaid } from 'mermaid';

export interface AstroMermaidOptions {
  /**
   * Default mermaid theme
   * @default 'default'
   */
  theme?: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  
  /**
   * Enable automatic theme switching based on data-theme attribute
   * @default true
   */
  autoTheme?: boolean;
  
  /**
   * Additional mermaid configuration options
   * @see https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults
   */
  mermaidConfig?: Record<string, any>;

  /**
   * User callback to be called when Mermaid is initialized
   */
  onMermaidInit?: (mermaid: Mermaid) => void;
}

/**
 * Astro integration for rendering Mermaid diagrams
 * 
 * @example
 * ```js
 * import { defineConfig } from 'astro/config';
 * import mermaid from 'astro-mermaid';
 * 
 * export default defineConfig({
 *   integrations: [
 *     mermaid({
 *       theme: 'forest',
 *       autoTheme: true
 *     })
 *   ]
 * });
 * ```
 */
export default function astroMermaid(options?: AstroMermaidOptions): AstroIntegration;