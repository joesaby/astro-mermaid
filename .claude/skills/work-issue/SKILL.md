---
name: work-issue
description: End-to-end workflow for resolving a GitHub issue in astro-mermaid — triages complexity, then runs brainstorm → TDD → implement → docs/spec → code review at the right depth. Use when the user says "work issue N", "fix issue N", "/work-issue N", or asks to resolve a GitHub issue/PR in this repo.
---

# Work an Issue

Resolve a GitHub issue for **astro-mermaid** with ceremony scaled to its complexity. Two phases — triage, then execute the tier.

The argument is an issue number (or PR number). If none is given, ask which issue.

## Step 0 — Load context
- `gh issue view <n>` (or `gh pr view <n>`) — read the full body and comments.
- Read `AGENTS.md`, `astro-mermaid-integration.js`, `astro-mermaid-integration.d.ts`.
- Create a branch: `git checkout -b fix/issue-<n>-<slug>` (use `feat/` for features). Never work on `main`.

## Step 1 — Triage into a tier
Classify the issue, then state the tier to the user before proceeding:

- **Trivial** — typo, dep bump, doc-only, copy fix. → Skip to "Implement" + "Verify". No subagents.
- **Standard** — a contained bug or feature with clear scope. → TDD → implement → docs → **one** code-reviewer subagent.
- **Subtle** — touches client serialization/security, the public config API, or has multiple viable approaches (the #18 class). → Full pipeline including the brainstorm subagent and an adversarial review.

When unsure, round **up** a tier.

## Step 2 — Brainstorm (Subtle tier only)
Spawn the **brainstorm** subagent (Agent tool, `subagent_type: "brainstorm"`) with the issue text. Wait for its ranked approaches. Pick one, tell the user which and why. Do not skip this for security/API issues — it exists to stop naive fixes (see #18).

## Step 3 — TDD (Standard + Subtle)
Write the failing test FIRST in `test/` (vitest). It must encode the regression that motivated the issue — i.e. it fails on `origin/main` and passes after the fix. Run `npm test` and confirm the new test fails for the right reason before implementing.

## Step 4 — Implement
Make the change in `astro-mermaid-integration.js` (and `.d.ts` if the public API changes). Honor the hard rules in `AGENTS.md` — especially: **never serialize user functions to the client.** Run `npm test` until green.

## Step 5 — Spec & docs update
If the public API or behavior changed, update in the same commit:
- `astro-mermaid-integration.d.ts` (types)
- `README.md` and `docs/API.md`
- `CHANGELOG.md` → `[Unreleased]`
Skip only for genuinely internal changes.

## Step 6 — Verify in a demo (when user-visible)
If the change affects rendering, add/adjust an example in a demo's content and confirm it renders (the `verify` or `run` skill, or a quick Playwright check). Refresh the stale `file:..` copy first: `cp astro-mermaid-integration.js astro-mermaid-integration.d.ts <demo>/node_modules/astro-mermaid/`.

## Step 7 — Code review (Standard + Subtle)
Spawn the **code-reviewer** subagent (`subagent_type: "code-reviewer"`) on the diff. Address every **blocking** finding (re-run review if needed). Report nits to the user.

## Step 8 — Commit & push
- Conventional Commits — `fix:` for bugs, `feat:` for features. Reference the issue (`fixes #<n>`).
- End the commit body with the `Co-Authored-By` trailer.
- Push the branch. Tell the user the branch is up and offer to open/update the PR (`gh pr create`).

## Notes
- Never edit `version` in `package.json` — semantic-release owns it.
- `docs:`/`chore:`/`test:` commits do not trigger a release; a `fix:`/`feat:` must carry the user-facing change for it to ship.
