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
4. Authentication uses **npm Trusted Publishing (OIDC)**, meaning no manual `NPM_TOKEN` secret is required in repository settings.

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

## Working an Issue

Use the **`/work-issue <n>`** skill to resolve a GitHub issue end-to-end. It triages the issue into a tier and scales the process accordingly:

- **Trivial** (typo, dep bump, doc-only): implement + verify, no subagents.
- **Standard** (contained bug/feature): write a failing test first → implement → update docs → one **pr-reviewer** subagent.
- **Subtle** (client serialization/security, public-API shape, multiple viable approaches): add an **architect** subagent up front and an adversarial review. The #18 serialization bug is the canonical example.

## Agents

Three skills in `.claude/skills/` are the entry points; five personas in `.claude/agents/` do the specialist work. Subagents cannot call each other, so the skill always calls the personas.

| Skill | Started by | Calls |
|-------|-----------|-------|
| `work-issue` | Jose, or `@claude` on an issue | architect, pr-reviewer |
| `review-pr` | `.github/workflows/agent-pr.yml` on every same-repo PR | architect, pr-reviewer, qa-verifier, security-reviewer |
| `triage-issues` | `.github/workflows/agent-issues.yml` on new issues and weekly | product-manager, architect |

- **`architect`** — explores approaches and trade-offs before code is written; flags naive fixes and release impact.
- **`pr-reviewer`** — adversarial pre-merge review; security, correctness, compat, test coverage, docs drift, release type.
- **`qa-verifier`** — runs tests, builds both demos, runs `scripts/check-render.mjs`, reproduces the claimed fix. Never edits code.
- **`security-reviewer`** — client-script injection and XSS, dependency and supply-chain risk, workflow and agent-config safety. Runs on Subtle PRs and any PR touching dependencies, workflows, agent config or release config.
- **`product-manager`** — classifies issues, finds duplicates, asks for missing info, writes acceptance criteria.

**Autonomous merging is off (Phase 1).** Agents comment and label only. `scripts/merge-gate.mjs` posts a dry-run table on each PR showing whether it *would* merge: non-releasing title, docs/demo/test scope (or a Dependabot dev bump), size caps, not agent-authored, and both `agent:automerge` and `agent:approved` labels. The gate runs from the base branch so a PR cannot change its own rules.

### Hard rules every agent must honor
1. **Never serialize arbitrary user-supplied functions into the client script.** The client bundle is built as a string; only plain data or safely-extracted values (e.g. a `fetch()` URL) may cross to the browser. `new Function(...)`/`eval` on user input is a security defect — this is what caused #18.
2. **Test-first** for behavior changes: a regression test in `test/` that fails on `main` and passes after the fix.
3. **Public-API changes** must update `astro-mermaid-integration.d.ts`, `README.md`, `docs/API.md`, and `CHANGELOG.md` in the same change.
4. **Always branch** — never commit directly to `main`.

## Netlify Deploy Previews

Both demos have `netlify.toml` configs. The build command pattern is:
```
cd .. && npm install && cd <demo-dir> && npm install && npm run build
```
The root `npm install` is needed so the `file:..` reference to `astro-mermaid` resolves correctly.
