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

## Markdown Processor (Astro version support)

`astro-mermaid` works on Astro 4, 5, 6, and 7 with **no extra configuration**. It
detects which markdown engine Astro is using at build time and registers its
transform the right way for each:

| Astro version | Markdown engine | How mermaid hooks in |
|---------------|-----------------|----------------------|
| 7+ | Sätteri (`@astrojs/markdown-satteri`, the new default) | a Sätteri **mdast plugin** |
| 6.4 – 6.x | `unified()` processor | remark + rehype plugins |
| < 6.4 | legacy pipeline | `remarkPlugins` / `rehypePlugins` arrays |

You normally don't set `markdown.processor` at all — Astro picks a default and
mermaid follows it. On **Astro 7 the default is Sätteri**, which is the faster
engine and the recommended choice.

### Choosing a processor explicitly

Both processors are fully supported, and diagrams render identically on either.
This demo sets Sätteri explicitly to make the preference clear:

```js
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import { satteri } from '@astrojs/markdown-satteri';
// import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  markdown: {
    // Preferred on Astro 7 — the default, faster engine.
    processor: satteri(),
    // Legacy alternative — mermaid works here too:
    // processor: unified(),
  },
  integrations: [
    mermaid({ theme: 'forest', autoTheme: true })
  ]
});
```

:::tip
If you previously pinned `markdown.processor: unified()` purely to keep mermaid
working after upgrading to Astro 7, you can drop that workaround and let Astro
use its default Sätteri processor.
:::