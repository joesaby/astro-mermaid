import type { AstroIntegration } from 'astro';

export interface IconPack {
  /**
   * Name of the icon pack
   */
  name: string;

  /**
   * URL to the icon pack JSON file (preferred, safe serialization).
   * @example 'https://unpkg.com/@iconify-json/logos@1/icons.json'
   */
  url?: string;

  /**
   * Inline icon data passed directly (e.g. imported from a JSON file).
   * Avoids any serialization concerns since it is plain data.
   * @example
   * ```js
   * import myIcons from './my-icons.json';
   * // ...
   * { name: 'my-icons', icons: myIcons }
   * ```
   */
  icons?: Record<string, any>;

  /**
   * Legacy: loader function whose source is inspected for a fetch() URL.
   * Prefer using the `url` or `icons` property instead for safer serialization.
   * @deprecated Use `url` or `icons` instead.
   */
  loader?: () => Promise<any>;
}

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
   * Enable client-side logging
   * @default true
   */
  enableLog?: boolean;

  /**
   * Inject the built-in diagram CSS into each page. Set to `false` to deliver
   * the styles yourself — e.g. when using a client-side router such as
   * @swup/astro that does not re-run injected scripts on navigation. Pair with
   * the {@link mermaidStyles} export injected once in a layout `<head>`.
   * @default true
   */
  injectStyles?: boolean;

  /**
   * Additional mermaid configuration options
   * @see https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults
   */
  mermaidConfig?: Record<string, any>;
  
  /**
   * Icon packs to register with mermaid
   * @example
   * ```js
   * iconPacks: [
   *   {
   *     name: 'logos',
   *     loader: () => fetch('https://unpkg.com/@iconify-json/logos@1/icons.json').then(res => res.json())
   *   }
   * ]
   * ```
   */
  iconPacks?: IconPack[];
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

/**
 * The CSS the integration applies to mermaid diagrams.
 *
 * Exported so you can deliver the styles yourself — useful with client-side
 * routers such as @swup/astro that do not re-run injected scripts on
 * navigation. Inject it once in a layout `<head>` and pair it with
 * `injectStyles: false`:
 *
 * @example
 * ```astro
 * ---
 * import { mermaidStyles } from 'astro-mermaid';
 * ---
 * <style is:global set:html={mermaidStyles} />
 * ```
 */
export const mermaidStyles: string;