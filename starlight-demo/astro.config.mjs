import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";

export default defineConfig({
  markdown: {
    // Ensure mermaid plugin is loaded
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
    }),
    starlight({
      title: "Astro Mermaid Demo",
      description:
        "A comprehensive demonstration of the astro-mermaid integration with Starlight",
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Welcome", slug: "index" },
            { label: "Installation", slug: "installation" },
            { label: "Configuration", slug: "configuration" },
          ],
        },
        {
          label: "Examples",
          items: [
            { label: "Flowcharts", slug: "examples/flowcharts" },
            { label: "Sequence Diagrams", slug: "examples/sequence" },
            // { label: "Gantt Charts", slug: "examples/gantt" },
            // { label: "Class Diagrams", slug: "examples/class" },
            // { label: "State Diagrams", slug: "examples/state" },
            // { label: "Entity Relationships", slug: "examples/er" },
            // { label: "User Journey", slug: "examples/journey" },
            // { label: "Git Graphs", slug: "examples/git" },
            // { label: "Pie Charts", slug: "examples/pie" },
            // { label: "Mindmaps", slug: "examples/mindmap" },
            // { label: "Timeline", slug: "examples/timeline" },
            // { label: "C4 Diagrams", slug: "examples/c4" },
          ],
        },
        // {
        //   label: "Advanced",
        //   items: [
        //     { label: "Theme Switching", slug: "advanced/themes" },
        //     { label: "Custom Configuration", slug: "advanced/configuration" },
        //     { label: "Performance Tips", slug: "advanced/performance" },
        //   ],
        // },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
