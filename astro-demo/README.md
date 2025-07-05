# Astro Mermaid Demo

A complete example showing how to use the `astro-mermaid` integration in a standard Astro project.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install astro-mermaid mermaid
   ```

2. **Add to your Astro config:**
   ```js
   // astro.config.mjs
   import { defineConfig } from "astro/config";
   import mermaid from "astro-mermaid";

   export default defineConfig({
     integrations: [
       mermaid({
         theme: "forest",
         autoTheme: true,
         mermaidConfig: {
           flowchart: { curve: "basis" }
         }
       })
     ]
   });
   ```

3. **Use in your content:**
   ```markdown
   # My Page

   Here's a diagram:

   \`\`\`mermaid
   graph TD
       A[Start] --> B[Process]
       B --> C[End]
   \`\`\`
   ```

## 📁 Project Structure

```
src/
├── content/
│   └── docs/           # Markdown files with mermaid diagrams
├── layouts/
│   └── Layout.astro    # Main layout (self-contained)
└── pages/
    ├── index.astro     # Home page
    ├── test.astro      # Direct .astro mermaid test
    └── docs/
        └── [...slug].astro  # Content collection pages
```

## 🎨 Features Demonstrated

- ✅ **Markdown Integration** - Use mermaid in `.md` files
- ✅ **Content Collections** - Organize docs with Astro content collections
- ✅ **Direct Usage** - Use `<pre class="mermaid">` directly in `.astro` files
- ✅ **Theme Switching** - Automatic light/dark theme support
- ✅ **Icon Packs** - Custom icons in architecture diagrams
- ✅ **Professional UI** - Clean, modern interface

## 🛠 Key Implementation Details

### Layout Independence
The `Layout.astro` is completely self-contained with:
- CSS variables for theming
- Grid-based responsive layout
- No external dependencies

### Theme Integration
```javascript
// Theme switching works with mermaid auto-theme
body.setAttribute('data-theme', newTheme);
```

### Content Collections
```typescript
// src/content/config.ts
export const collections = {
  docs: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      description: z.string(),
    }),
  }),
};
```

## 📋 Dependencies

**Required:**
- `astro` - Astro framework
- `astro-mermaid` - The mermaid integration
- `mermaid` - Mermaid.js library

**No additional dependencies needed** - everything else is built-in.

## 🎯 Usage as Template

To use this as a starting point for your project:

1. Copy the essential files:
   - `astro.config.mjs` - Configuration
   - `src/layouts/Layout.astro` - Layout (optional)
   - `src/content/config.ts` - Content schema (if using collections)

2. Customize the integration options in `astro.config.mjs`

3. Start adding your mermaid diagrams to `.md`, `.mdx`, or `.astro` files

## 🔧 Configuration Options

```js
mermaid({
  theme: 'forest',           // Default theme
  autoTheme: true,          // Auto light/dark switching
  mermaidConfig: {          // Mermaid.js config
    flowchart: { curve: 'basis' }
  },
  iconPacks: [             // Optional icon packs
    {
      name: 'logos',
      loader: () => fetch('https://unpkg.com/@iconify-json/logos@1/icons.json').then(res => res.json())
    }
  ]
})
```

## 📚 Examples

This demo includes examples of all major mermaid diagram types:
- Flowcharts
- Sequence diagrams  
- Gantt charts
- Class diagrams
- Entity-relationship diagrams
- State diagrams
- User journey maps
- Git graphs
- Pie charts
- Mind maps
- Timeline diagrams
- C4 architecture diagrams

Visit the running demo to see them all in action!