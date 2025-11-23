import { defineConfig } from "astro/config";
import mermaid from "astro-mermaid";

export default defineConfig({
  markdown: {
    // Enable markdown processing
    remarkPlugins: [],
    rehypePlugins: [],
  },
  content: {
    collections: {
      docs: {
        type: "content",
        schema: {
          title: "string",
          description: "string",
        },
      },
    },
  },
  integrations: [
    mermaid({
      theme: "forest",
      autoTheme: true,
      mermaidConfig: {
        flowchart: {
          curve: "basis",
        },
        theme: "forest",
      },
      iconPacks: [
        {
          name: "logos",
          loader: () =>
            fetch("https://unpkg.com/@iconify-json/logos@1/icons.json").then(
              (res) => res.json()
            ),
        },
        {
          name: "iconoir",
          loader: () =>
            fetch("https://unpkg.com/@iconify-json/iconoir@1/icons.json").then(
              (res) => res.json()
            ),
        },
        {
          name: "test-icons",
          icons: {
            prefix: "test",
            icons: {
              circle: {
                body: '<circle cx="12" cy="12" r="10" fill="red" />',
                width: 24,
                height: 24
              }
            }
          }
        }
      ],
    }),
  ],
});
