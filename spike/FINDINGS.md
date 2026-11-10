# Renderer spike (issue #10): mermaid.js vs merman vs mmdr

Corpus: all 79 ```mermaid blocks in `astro-demo/src/content/docs` (`corpus/`).
Harness: `bench.mjs` runs each engine inside headless Chromium (same browser for all three), timing
`render()` per diagram: **first** = first render of that diagram (includes lazy diagram-chunk loading
for mermaid.js), **warm** = median of 3 repeats. `compare.mjs` diffs the SVGs against mermaid.js.

Branches: `spike/mermaidjs` (baseline), `spike/merman` (`@mermanjs/web` 0.9.2, WASM), `spike/mmdr`
(mermaid-rs-renderer; see caveat). Combined results are on `spike/mmdr`: `results/compare.md`, `results/*.json`, `results/*/*.svg`.

## Timing (79 diagrams, ms)

| engine | init | first-render total | warm total | errors | wasm size |
|---|---|---|---|---|---|
| mermaid.js 11 | 11 | 5815 | 4882 | 0 | n/a (JS, 2.1 MB entry + lazy chunks) |
| merman 0.9.2 | 119 | 1130 (5x) | 662 (7x) | 0 | 13.4 MB |
| mmdr 0.2.2 | 23 | 653 (9x) | 549 (9x) | 0 | 2.1 MB |

Biggest per-diagram gaps: C4 (130 ms -> 10 ms merman, 2 ms mmdr), mindmap (200 -> 23 / 1.3), class
(160 -> 12 / 2), state (120-137 -> 9 / 32-40; mmdr is *not* faster on state or ER). Light diagram types
(pie, sequence, journey) are already <30 ms in mermaid.js, so there is little to gain.

## Fidelity (vs mermaid.js output, eyeballed + metrics)

- **merman**: closest. Same text on 15/16 diagram types, area ratio ~1.0 on most. Differences: its own default
  styling (square boxes, per-class colours), and **text is clipped in class diagrams** (e.g. "Vehicl", "Drive")
  and some node labels, so text measurement is approximate without the real fonts. gitGraph low textSim is
  random commit hashes, not a defect.
- **mmdr**: much further off. **Timeline is rendered in a different layout** (single horizontal strip,
  ~0.28x area); **architecture-beta ignores the declared edge directions** (one row, 4x aspect change);
  **state diagram has overlapping edges and labels**; class diagrams reorder nodes and clip edge labels.
  Fine for flowchart / sequence / pie / journey / mindmap.
- Neither engine supports icon packs (both draw `?` placeholders for architecture-beta, same as mermaid.js
  with no packs registered; not tested with packs).
- Dark theme / `autoTheme` not tested.

## Caveats

- `@mermanjs/web` is browser-only (not Node/SSR); build-time use would need `@mermanjs/node` (native, not tested).
- crates.io is blocked in this sandbox, so mmdr was **not built from source**. The WASM is the prebuilt Typst
  plugin build of mermaid-rs-renderer from `typst/packages` (`fetch-mmdr.sh`), theme `default`; current crate may differ.
- Single run in a shared sandbox; treat timings as relative, not absolute.
- mermaid.js's flowcharts-7 SVG does not display in an `<img>` (harness artefact when screenshotting), not a render failure.
