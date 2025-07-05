import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";
import mermaidZoom from "../astro-mermaid-zoom-addon.js";

export default defineConfig({
  integrations: [
    // Original mermaid integration (working)
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
    // Add zoom functionality as a separate addon
    mermaidZoom({
      zoomOnClick: true,
      showCloseButton: true,
      backdropOpacity: 0.9,
      animationDuration: 300,
      enableKeyboardClose: true
    }),
    starlight({
      title: "Astro Mermaid Demo with Clean Zoom",
      description: "Clean zoom implementation for mermaid diagrams",
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Welcome", slug: "index" },
            { label: "Installation", slug: "installation" },
            { label: "Configuration", slug: "configuration" },
            { label: "Zoom test", slug: "zoom-test" },
          ],
        },
        {
          label: "Examples",
          items: [
            { label: "Flowcharts", slug: "examples/flowcharts" },
            { label: "Sequence Diagrams", slug: "examples/sequence" },
            { label: "Gantt Charts", slug: "examples/gantt" },
            { label: "Class Diagrams", slug: "examples/class" },
            { label: "State Diagrams", slug: "examples/state" },
            { label: "Entity Relationships", slug: "examples/er" },
            { label: "User Journey", slug: "examples/journey" },
            { label: "Git Graphs", slug: "examples/git" },
            { label: "Pie Charts", slug: "examples/pie" },
            { label: "Mindmaps", slug: "examples/mindmap" },
            { label: "Timeline", slug: "examples/timeline" },
            { label: "C4 Diagrams", slug: "examples/c4" },
          ],
        },
      ],
    }),
  ],
});