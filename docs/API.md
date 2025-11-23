# API Reference

## mermaid()

The main integration function for astro-mermaid.

### Signature

```typescript
function mermaid(options?: MermaidOptions): AstroIntegration
```

### Parameters

#### options (optional)

An object with configuration options:

```typescript
interface MermaidOptions {
  theme?: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  autoTheme?: boolean;
  mermaidConfig?: Record<string, any>;
  iconPacks?: IconPack[];
}
```

### Options

#### `theme`
- **Type**: `'default' | 'dark' | 'forest' | 'neutral' | 'base'`
- **Default**: `'default'`
- **Description**: The default Mermaid theme to use when `autoTheme` is disabled

#### `autoTheme`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable automatic theme switching based on the `data-theme` attribute

#### `mermaidConfig`
- **Type**: `Record<string, any>`
- **Default**: `{}`
- **Description**: Additional Mermaid.js configuration options. See [Mermaid Configuration](https://mermaid.js.org/config/setup/modules/mermaidAPI.html)

#### `iconPacks`
- **Type**: `IconPack[]`
- **Default**: `[]`
- **Description**: Array of icon packs to register for use in diagrams

### IconPack Interface

```typescript
interface IconPack {
  name: string;
  loader?: () => Promise<Record<string, any>>;
  icons?: Record<string, any>;
}
```

> **Note**: You must provide either `loader` or `icons`. Use `icons` when passing data directly (e.g. from an import) to avoid serialization issues.
```

### Returns

An Astro integration object that can be used in the `integrations` array of `astro.config.mjs`.

## Usage Examples

### Basic Usage

```js
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';

export default defineConfig({
  integrations: [mermaid()]
});
```

### Advanced Configuration

```js
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';

export default defineConfig({
  integrations: [
    mermaid({
      theme: 'forest',
      autoTheme: true,
      mermaidConfig: {
        flowchart: {
          curve: 'basis',
          padding: 15
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10
        }
      },
      iconPacks: [
        {
          name: 'logos',
          loader: () => fetch('https://unpkg.com/@iconify-json/logos@1/icons.json').then(res => res.json())
        },
        {
          name: 'my-icons',
          icons: { /* icon data */ } // Use this for imported JSON
        }
      ]
    })
  ]
});
```

## Integration Order

When using with other markdown-processing integrations like Starlight, place mermaid **first** in the integrations array:

```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  integrations: [
    mermaid(), // Must come BEFORE starlight
    starlight({ /* config */ })
  ]
});
```

## Type Definitions

The integration includes comprehensive TypeScript definitions. All configuration options are fully typed for better developer experience.

```typescript
// Full type support in astro.config.mjs
import mermaid from 'astro-mermaid';

// TypeScript will provide autocomplete and validation
export default defineConfig({
  integrations: [
    mermaid({
      theme: 'forest', // ✅ Valid
      // theme: 'invalid', // ❌ TypeScript error
    })
  ]
});
```