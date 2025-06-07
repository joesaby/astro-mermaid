---
title: Configuration
description: Configuration options for astro-mermaid
---

## Configuration Options

The astro-mermaid integration accepts the following options:

### `theme`

The default Mermaid theme to use.

- Type: `'default' | 'dark' | 'forest' | 'neutral' | 'base'`
- Default: `'default'`

```js
mermaid({
  theme: 'forest'
})
```

### `autoTheme`

Enable automatic theme switching based on the `data-theme` attribute on the document root.

- Type: `boolean`
- Default: `true`

When enabled:
- `data-theme="light"` → uses 'default' mermaid theme
- `data-theme="dark"` → uses 'dark' mermaid theme

```js
mermaid({
  autoTheme: false // Disable auto theme switching
})
```

### `mermaidConfig`

Additional Mermaid configuration options. See the [Mermaid configuration documentation](https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults) for all available options.

- Type: `object`
- Default: `{}`

```js
mermaid({
  mermaidConfig: {
    startOnLoad: false,
    flowchart: {
      curve: 'basis',
      padding: 15
    },
    sequence: {
      diagramMarginX: 50,
      diagramMarginY: 10
    },
    gantt: {
      fontSize: 12,
      numberSectionStyles: 4
    }
  }
})
```

## Example Configurations

### Minimal Setup

```js
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';

export default defineConfig({
  integrations: [mermaid()]
});
```

### Dark Theme with Custom Flowchart

```js
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';

export default defineConfig({
  integrations: [
    mermaid({
      theme: 'dark',
      autoTheme: false,
      mermaidConfig: {
        flowchart: {
          curve: 'linear',
          nodeSpacing: 50,
          rankSpacing: 50
        }
      }
    })
  ]
});
```

### Production Optimized

```js
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';

export default defineConfig({
  integrations: [
    mermaid({
      theme: 'neutral',
      autoTheme: true,
      mermaidConfig: {
        startOnLoad: false,
        logLevel: 'error',
        securityLevel: 'strict'
      }
    })
  ]
});
```