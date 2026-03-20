# Contributing to astro-mermaid

Thanks for your interest in contributing! This guide covers the workflow and conventions used in this project.

## Getting Started

```bash
git clone https://github.com/joesaby/astro-mermaid.git
cd astro-mermaid
npm install
```

### Running Tests

```bash
npm test              # Run tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Running Demos Locally

**Starlight demo** (documentation site with Starlight):
```bash
cd starlight-demo
npm install
npm run dev
```

**Standalone demo** (pure Astro site):
```bash
cd astro-demo
npm install
npm run dev
```

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Purpose | Triggers Release? |
|------|---------|-------------------|
| `feat` | New feature | Yes (minor) |
| `fix` | Bug fix | Yes (patch) |
| `docs` | Documentation only | No |
| `chore` | Maintenance, dependencies | No |
| `ci` | CI/CD changes | No |
| `test` | Adding or updating tests | No |
| `refactor` | Code restructuring (no behavior change) | No |
| `style` | Formatting, whitespace | No |

### Breaking Changes

For breaking changes, either:

- Add `!` after the type: `feat!: drop Astro 4 support`
- Add a `BREAKING CHANGE:` footer:
  ```
  feat: require Astro 6 content config format

  BREAKING CHANGE: Content config must now use src/content.config.ts with loaders
  ```

Both approaches trigger a **major** version bump.

### Examples

```
fix: resolve theme flicker on initial page load
feat: add quadrant chart diagram support
feat(icons): support custom icon packs in architecture diagrams
chore: update dev dependencies
docs: add migration guide for Astro 6
feat!: require Astro 6 as minimum version
```

## Pull Request Workflow

1. **Create a branch** from `main`
2. **Make your changes** with conventional commit messages
3. **Open a PR** — Netlify deploy previews will run automatically for both demos
4. **Wait for review** — ensure deploy previews pass
5. **Merge** — on merge to `main`, semantic-release automatically:
   - Determines the version bump from commit messages
   - Updates `package.json` version
   - Publishes to npm
   - Creates a GitHub release with changelog
   - Creates a git tag

> **Important**: Never manually edit the `version` field in `package.json`. semantic-release manages this automatically.

## Project Structure

| Path | Purpose |
|------|---------|
| `astro-mermaid-integration.js` | Main integration (remark + rehype plugins, client-side script) |
| `astro-mermaid-integration.d.ts` | TypeScript type definitions |
| `starlight-demo/` | Demo site using Astro Starlight |
| `astro-demo/` | Demo site using standalone Astro |
| `.github/workflows/release.yml` | semantic-release CI pipeline |

## Important Notes

- The mermaid integration **must** be listed before Starlight in `astro.config.mjs`
- Demo `package-lock.json` files are gitignored — they regenerate on install
- Content config for Astro 6 goes at `src/content.config.ts` (not `src/content/config.ts`)
- The peer dependency is `astro >=4`, supporting Astro 4, 5, and 6
