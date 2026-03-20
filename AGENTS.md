# Agent Instructions - astro-mermaid

## Project Summary

astro-mermaid is an Astro integration that renders Mermaid diagrams in markdown with automatic theme switching and client-side rendering. It is published to npm as `astro-mermaid`.

## Architecture

- **Main integration**: `astro-mermaid-integration.js` — dual remark/rehype plugin system that transforms mermaid code blocks into rendered diagrams
- **Type definitions**: `astro-mermaid-integration.d.ts`
- **Demos**: `starlight-demo/` (Starlight docs site) and `astro-demo/` (standalone Astro site)
- **Tests**: Run with `npm test` (Vitest)

## Key Constraints

1. **Integration order matters**: In `astro.config.mjs`, the mermaid integration MUST be listed BEFORE Starlight
2. **Astro 6 content config**: Content config must be at `src/content.config.ts` (not `src/content/config.ts`) with a `loader` defined
3. **Peer dependency**: `astro >=4` — the integration supports Astro 4, 5, and 6
4. **Demo lockfiles are gitignored**: `starlight-demo/package-lock.json` and `astro-demo/package-lock.json` are not tracked; they regenerate on install

## Commit Convention

This project uses **semantic-release** with **Conventional Commits**. All commits must follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types and their effect on versioning

| Type | Release | Example |
|------|---------|---------|
| `fix` | Patch | `fix: prevent theme flicker on initial load` |
| `feat` | Minor | `feat: add support for quadrant charts` |
| `feat!` | **Major** | `feat!: drop Astro 4 support` |
| `BREAKING CHANGE:` footer | **Major** | Any type with this footer triggers a major release |
| `chore`, `docs`, `ci`, `test`, `refactor`, `style` | None | `chore: update dev dependencies` |

### Rules
- PR titles should use conventional commit format (they become the commit message on squash merge)
- Never manually edit `version` in `package.json` — semantic-release manages it
- `chore:` commits do NOT trigger a release

## Release Pipeline

1. Push/merge to `main` triggers `.github/workflows/release.yml`
2. `semantic-release` analyzes commits since last release
3. If a releasable commit is found: bumps version, publishes to npm, creates GitHub release and tag
4. Required secrets: `NPM_TOKEN` (npm publish), `GITHUB_TOKEN` (auto-provided)

## Development Workflow

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run starlight demo locally
cd starlight-demo && npm install && npm run dev

# Run standalone demo locally
cd astro-demo && npm install && npm run dev
```

## Netlify Deploy Previews

Both demos have `netlify.toml` configs. The build command pattern is:
```
cd .. && npm install && cd <demo-dir> && npm install && npm run build
```
The root `npm install` is needed so the `file:..` reference to `astro-mermaid` resolves correctly.
