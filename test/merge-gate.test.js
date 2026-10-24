import { describe, it, expect } from 'vitest';
import { evaluateGate, formatReport } from '../scripts/merge-gate.mjs';

const base = {
  title: 'docs: fix typo in README',
  author: { login: 'joesaby' },
  isDraft: false,
  labels: [{ name: 'agent:automerge' }, { name: 'agent:approved' }],
  files: [{ path: 'README.md', additions: 2, deletions: 1 }]
};
const pr = overrides => ({ ...base, ...overrides });
const failed = result => result.checks.filter(c => !c.pass).map(c => c.name);

describe('merge gate', () => {
  it('accepts a labelled docs-only PR', () => {
    expect(evaluateGate(base).eligible).toBe(true);
  });

  it('rejects release-triggering titles', () => {
    for (const title of ['fix: theme flicker', 'feat: new option', 'docs!: drop section', 'chore!: breaking']) {
      expect(evaluateGate(pr({ title })).eligible).toBe(false);
    }
  });

  it('rejects changes to the integration, workflows, agent config and the gate itself', () => {
    for (const path of [
      'astro-mermaid-integration.js',
      'astro-mermaid-integration.d.ts',
      'package.json',
      '.github/workflows/ci.yml',
      '.claude/agents/pr-reviewer.md',
      'scripts/merge-gate.mjs',
      'AGENTS.md'
    ]) {
      const result = evaluateGate(pr({ files: [{ path, additions: 1, deletions: 0 }] }));
      expect(result.eligible, path).toBe(false);
    }
  });

  it('rejects paths outside the allowlist', () => {
    const result = evaluateGate(pr({ files: [{ path: 'vitest.config.js', additions: 1, deletions: 0 }] }));
    expect(failed(result)).toEqual(['Scope: docs, demos and tests only']);
  });

  it('accepts demo and test changes', () => {
    const files = [
      { path: 'starlight-demo/src/content/docs/examples/pie.md', additions: 10, deletions: 2 },
      { path: 'test/remark-plugin.test.js', additions: 20, deletions: 0 }
    ];
    expect(evaluateGate(pr({ title: 'test: cover pie charts', files })).eligible).toBe(true);
  });

  it('requires both opt-in and approval labels', () => {
    expect(evaluateGate(pr({ labels: [{ name: 'agent:automerge' }] })).eligible).toBe(false);
    expect(evaluateGate(pr({ labels: [{ name: 'agent:approved' }] })).eligible).toBe(false);
  });

  it('never merges a PR an agent authored', () => {
    for (const login of ['claude[bot]', 'app/claude', 'github-actions[bot]']) {
      expect(evaluateGate(pr({ author: { login } })).eligible, login).toBe(false);
    }
  });

  it('rejects drafts', () => {
    expect(evaluateGate(pr({ isDraft: true })).eligible).toBe(false);
  });

  it('caps size, ignoring lockfile churn', () => {
    const big = [{ path: 'docs/API.md', additions: 301, deletions: 0 }];
    expect(evaluateGate(pr({ files: big })).eligible).toBe(false);
    const many = Array.from({ length: 11 }, (_, i) => ({ path: `docs/p${i}.md`, additions: 1, deletions: 0 }));
    expect(evaluateGate(pr({ files: many })).eligible).toBe(false);
  });

  it('accepts a Dependabot devDependency bump with lockfile churn', () => {
    const result = evaluateGate(
      pr({
        title: 'chore(deps-dev): bump undici from 7.1.0 to 7.2.0',
        author: { login: 'app/dependabot' },
        files: [
          { path: 'package.json', additions: 1, deletions: 1 },
          { path: 'package-lock.json', additions: 900, deletions: 850 }
        ]
      })
    );
    expect(result.eligible).toBe(true);
  });

  it('rejects a Dependabot production dependency bump', () => {
    const result = evaluateGate(
      pr({
        title: 'chore(deps): bump unist-util-visit from 5.0.0 to 5.1.0',
        author: { login: 'app/dependabot' },
        files: [{ path: 'package.json', additions: 1, deletions: 1 }]
      })
    );
    expect(result.eligible).toBe(false);
  });

  it('rejects a non-Dependabot PR posing as a dev bump', () => {
    const result = evaluateGate(
      pr({ title: 'chore(deps-dev): bump x', files: [{ path: 'package.json', additions: 1, deletions: 1 }] })
    );
    expect(result.eligible).toBe(false);
  });

  it('formats a dry-run report with a stable marker', () => {
    const report = formatReport(evaluateGate(base));
    expect(report).toContain('<!-- agent-merge-gate -->');
    expect(report).toContain('would merge once required checks are green');
  });
});
