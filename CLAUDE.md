# Claude Memory - Astro Mermaid Integration

## Project Overview
Created a complete astro-mermaid integration for rendering Mermaid diagrams in Astro projects with automatic theme switching and client-side rendering.

## Project Structure
```
astro-mermaid/
├── astro-mermaid-integration.js     # Main integration file (ENHANCED)
├── astro-mermaid-integration.d.ts   # TypeScript definitions
├── package.json                     # Package configuration
├── README.md                        # Documentation
├── CONTRIBUTING.md                  # Contribution guidelines
├── AGENTS.md                        # AI agent instructions
├── .npmrc                          # NPM authentication
├── .gitignore                      # Git ignore rules
├── .github/workflows/release.yml   # semantic-release CI pipeline
├── starlight-demo/                 # Working demo with Starlight
│   ├── package.json
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   └── src/
│       ├── content.config.ts        # Astro 6 content config (with loader)
│       ├── content/
│       │   └── docs/
│       │       ├── index.mdx
│       │       ├── installation.md
│       │       ├── configuration.md
│       │       ├── test-icons.md     # Icon pack test page
│       │       └── examples/
│       │           ├── flowcharts.md
│       │           ├── sequence.md
│       │           ├── gantt.md
│       │           ├── class.md     # Fixed multiplicity syntax
│       │           └── [other diagrams...]
│       ├── styles/
│       │   └── custom.css
│       └── env.d.ts
└── astro-demo/                     # Professional standalone demo
    ├── README.md                   # Complete setup guide
    ├── package.json               # Minimal dependencies
    ├── astro.config.mjs           # Universal configuration
    ├── tsconfig.json
    └── src/
        ├── content.config.ts       # Astro 6 content config (with loader)
        ├── content/
        │   └── docs/               # All diagram examples
        │       ├── installation.md
        │       ├── configuration.md
        │       ├── test-icons.md
        │       └── [all diagram types...]
        ├── layouts/
        │   └── Layout.astro       # Self-contained professional layout
        └── pages/
            ├── index.astro        # Feature showcase page
            ├── test.astro         # Direct .astro usage demo
            └── docs/
                └── [...slug].astro # Content collection router
```

## Key Technical Implementation

### Integration Features
- **Dual Plugin System**: Both remark + rehype plugins for universal markdown processing
- **Universal Theme Detection**: Supports both `html[data-theme]` and `body[data-theme]` attributes
- **Client-side rendering**: Dynamic mermaid.js loading with performance optimization
- **Automatic theme switching**: Real-time diagram re-rendering on theme changes
- **Built-in responsive CSS**: Comprehensive styling with loading states and animations
- **TypeScript support**: Full type definitions and intellisense
- **Icon pack support**: Custom icons for architecture diagrams via iconify
- **Content Collection Support**: Works seamlessly with Astro content collections

### Critical Setup Order
**IMPORTANT**: The mermaid integration MUST be placed BEFORE Starlight in the integrations array for the rehype plugin to work correctly:

```js
// astro.config.mjs
export default defineConfig({
  integrations: [
    mermaid({
      theme: "forest",
      autoTheme: true,
      mermaidConfig: {
        flowchart: { curve: "basis" }
      }
    }),
    starlight({ /* config */ })  // AFTER mermaid
  ]
});
```

### Configuration Options
```js
mermaid({
  theme: 'forest',              // 'default', 'dark', 'forest', 'neutral', 'base'
  autoTheme: true,              // Enable automatic theme switching
  mermaidConfig: {              // Additional mermaid configuration
    flowchart: { curve: 'basis' },
    startOnLoad: false
  },
  iconPacks: [                  // Register icon packs for use in diagrams
    {
      name: 'logos',
      loader: () => fetch('https://unpkg.com/@iconify-json/logos@1/icons.json').then(res => res.json())
    },
    {
      name: 'iconoir',
      loader: () => fetch('https://unpkg.com/@iconify-json/iconoir@1/icons.json').then(res => res.json())
    }
  ]
})
```

### Built-in CSS Features
The integration includes comprehensive CSS out of the box:
- Responsive SVG sizing with max-width: 100%
- Flexbox centering with proper spacing (margin: 2rem 0)
- Smooth opacity transitions to prevent flash of unstyled content
- Theme-aware subtle backgrounds for light/dark modes
- Horizontal scrolling for large diagrams
- Rounded corners and padding for better visual presentation

### Client-Side Rendering Logic
- Detects data-theme changes for automatic theme switching
- Processes diagrams on DOM ready and after Astro view transitions
- Stores original diagram content in data-diagram attribute
- Generates unique IDs for each diagram (mermaid-{random})
- Includes comprehensive console logging for debugging

## NPM Package Details
- **Package Name**: astro-mermaid
- **Author**: Jose Sebastian
- **NPM Account**: joesaby
- **Repository**: https://github.com/joesaby/astro-mermaid
- **Auth Token**: Configured in .npmrc (not committed to version control)

### Dependencies
- **Peer Dependencies**: astro >=4, mermaid ^10.0.0 || ^11.0.0
- **Runtime Dependencies**: import-meta-resolve ^4.2.0, mdast-util-to-string ^4.0.0, unist-util-visit ^5.0.0
- **Dev Dependencies**: TypeScript, Astro 6, Mermaid, Vitest for development

## Versioning & Release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) with [Conventional Commits](https://www.conventionalcommits.org/).

### How it works
- Pushing to `main` triggers the `.github/workflows/release.yml` workflow
- semantic-release analyzes commit messages and determines the version bump
- It automatically creates a GitHub release, git tag, and publishes to npm

### Commit message format
| Prefix | Version bump | Example |
|--------|-------------|---------|
| `fix:` | Patch (1.0.x) | `fix: resolve theme flicker on load` |
| `feat:` | Minor (1.x.0) | `feat: add quadrant chart support` |
| `feat!:` or `BREAKING CHANGE:` footer | Major (x.0.0) | `feat!: require Astro 6` |
| `chore:`, `docs:`, `ci:`, `test:` | No release | `chore: update dev dependencies` |

### PR workflow
1. Create a branch and make changes
2. Use conventional commit messages in your commits
3. Open a PR — Netlify deploy previews run automatically
4. On merge to `main`, semantic-release handles versioning and npm publish

## Usage Example
After installation with `npm install astro-mermaid mermaid`:

```js
// astro.config.mjs
import mermaid from 'astro-mermaid';
export default defineConfig({
  integrations: [mermaid()]
});
```

Then in markdown files:
````markdown
```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Retry]
```
````

## Working Demo
- Successfully running at http://localhost:4321 in starlight-demo
- All mermaid diagrams render correctly including architecture-beta diagrams with icon packs
- Theme switching works automatically
- Integrates seamlessly with Starlight documentation
- Fixed class diagram syntax error in multiplicity relationships

## Publishing Status
Publishing is fully automated via semantic-release:
- Merging a `feat:` or `fix:` commit to `main` triggers npm publish
- GitHub Releases and git tags are created automatically
- NPM_TOKEN secret must be configured in GitHub repository settings

The integration provides a zero-configuration solution for beautiful mermaid diagrams in Astro projects.

## Recent Updates (2025-07-05)

### Major Integration Enhancements
1. **Universal Theme Detection**: Fixed theme detection to work with both `document.documentElement` and `document.body` data-theme attributes, making the integration compatible with all Astro projects regardless of theme implementation.

2. **Dual Plugin System**: Added remark plugin as fallback alongside existing rehype plugin to ensure mermaid code blocks are transformed correctly across all markdown processing contexts (content collections, direct markdown, etc.).

3. **Enhanced Client-Side Logic**: Improved mutation observers to watch both html and body elements for theme changes, ensuring reliable theme switching in all scenarios.

### Professional Demo Implementation
4. **astro-demo Creation**: Built a complete standalone demo showcasing the integration in a pure Astro project (non-Starlight):
   - **Professional UI**: Modern grid-based layout with header, sidebar, and main content areas
   - **CSS Variable System**: Comprehensive dark/light theme implementation
   - **Self-Contained Layout**: Zero external dependencies beyond core requirements
   - **Responsive Design**: Mobile-friendly with adaptive navigation
   - **Complete Documentation**: In-depth README with setup instructions

5. **Universal File Support**: Demonstrated and tested compatibility with:
   - `.md` files (via remark plugin)
   - `.mdx` files (via remark plugin)
   - `.astro` files (direct `<pre class="mermaid">` usage)
   - Content collections with frontmatter schemas

6. **Template-Ready Structure**: The astro-demo can be used as a starting template for any Astro project wanting mermaid integration, with clear separation between demo-specific and reusable code.

### Dependency Optimization
7. **Cleaned Package Dependencies**: Removed `mdast-util-to-string` and `unist-util-visit` from user-facing package.json since these are handled internally by the integration.

8. **Theme Persistence**: Added localStorage support for theme preferences with proper initialization.

## Claude Code Web Environment Notes

When running Claude Code from the web (not the local CLI), there are significant limitations around GitHub API operations. Keep these in mind:

### What works
- `git fetch`, `git pull`, `git push` — all work via the local proxy (`http://local_proxy@127.0.0.1:27469/git/...`)
- Reading PR diffs by fetching the PR ref locally: `git fetch origin pull/<N>/head:pr-<N>` then `git diff origin/main...pr-<N>`
- Committing and pushing branches

### What does NOT work
- **`gh` CLI** is not pre-installed and even after installing it, it cannot authenticate against the local proxy (it expects `github.com` or a GHE host, not `127.0.0.1`)
- **Creating PRs via API** — the local git proxy only supports git-protocol paths (`/git/<owner>/<repo>`), not GitHub REST API paths (`/api/repos/...`). Attempts to call `https://api.github.com` directly fail with 401 because there are no GitHub credentials available
- **Posting PR review comments** — same limitation as above

### Recommended workflow for PR creation in web sessions
1. Do all code changes, commit, and push to the branch — this works fine
2. **Tell the user** the branch is pushed and ask them to create the PR manually, or provide the PR title/body text for them to copy-paste
3. Alternatively, the user can pre-install and authenticate `gh` CLI before starting the session (e.g., via a SessionStart hook that runs `gh auth login`)

### Recommended workflow for PR reviews in web sessions
1. Fetch the PR ref locally: `git fetch origin pull/<N>/head:pr-<N>`
2. Use `git diff origin/main...pr-<N>` and `git show pr-<N>:<file>` to read the full diff
3. Use `WebFetch` on the PR page URL to get metadata (title, description, comments)
4. Write the review as a message to the user — posting comments directly to GitHub is not possible

### Astro 6 Upgrade (2026-03-20)
1. **Content Config Migration**: Moved `src/content/config.ts` to `src/content.config.ts` in both demos (Astro 6 requirement). Collections must define a `loader` parameter.
2. **Demo Dependencies**: Updated both starlight-demo and astro-demo to `astro@^6.0.0` and `@astrojs/starlight@^0.38.0`.
3. **Peer Dependency**: Simplified to `>=4` for maximum compatibility.
4. **Stale Lockfiles**: Removed demo `package-lock.json` files from git tracking (added to `.gitignore`) to prevent resolution conflicts in CI.
5. **Semantic Release**: Added automated versioning and npm publishing via semantic-release with conventional commits.

### Previous Updates (2025-06-18)
1. **Icon Pack Support**: Added ability to pass icon packs directly in astro.config.mjs configuration instead of requiring a callback function. Icons can be used in architecture-beta diagrams.
2. **Bug Fix**: Fixed class diagram syntax error in multiplicity relationships by replacing `||--o{` notation with standard `"1" --> "*"` notation.
3. **Demo Updates**: Added test-icons.md page demonstrating icon pack usage with both logos and iconoir icon packs.