// Merge gate for agent auto-merge.
// Decides, without any model judgment, whether a PR is eligible to be merged
// by the PR agent. Required CI checks are enforced separately by branch
// protection, so they are not evaluated here.
//
// CLI: gh pr view <n> --json title,author,isDraft,labels,files | node scripts/merge-gate.mjs
// Prints a markdown report. Exits 0 either way: Phase 1 is dry-run only.

const ALLOWED_TYPES = /^(chore|docs|test|ci)(\([^)]*\))?: \S/;
const PROTECTED = [
  'astro-mermaid-integration.js',
  'astro-mermaid-integration.d.ts',
  'package.json',
  'package-lock.json',
  '.releaserc.json',
  'AGENTS.md',
  'CLAUDE.md',
  '.github/',
  '.claude/',
  'scripts/'
];
const ALLOWED = [/^docs\//, /^test\//, /^starlight-demo\//, /^astro-demo\//, /\.md$/];
const DEPENDABOT_FILES = ['package.json', 'package-lock.json', 'starlight-demo/package.json', 'astro-demo/package.json'];
const AGENT_AUTHORS = ['claude', 'github-actions'];
const MAX_FILES = 10;
const MAX_LINES = 300;
export const LABELS = { optIn: 'agent:automerge', approved: 'agent:approved' };

const login = author => (author?.login || '').replace(/^app\//, '').replace(/\[bot\]$/, '');
const isProtected = path => PROTECTED.some(p => (p.endsWith('/') ? path.startsWith(p) : path === p));

export function evaluateGate(pr) {
  const paths = pr.files.map(f => f.path);
  const author = login(pr.author);
  const labels = pr.labels.map(l => l.name);
  const dependabotDev =
    author === 'dependabot' &&
    pr.title.startsWith('chore(deps-dev):') &&
    paths.every(p => DEPENDABOT_FILES.includes(p));

  const blocked = dependabotDev
    ? []
    : paths.filter(p => isProtected(p) || !ALLOWED.some(re => re.test(p)));
  const lines = pr.files
    .filter(f => !f.path.endsWith('package-lock.json'))
    .reduce((n, f) => n + f.additions + f.deletions, 0);

  const checks = [
    { name: 'Not a draft', pass: !pr.isDraft },
    { name: 'Not authored by an agent', pass: !AGENT_AUTHORS.includes(author), detail: author },
    { name: 'Non-releasing title (chore/docs/test/ci, no !)', pass: ALLOWED_TYPES.test(pr.title), detail: pr.title },
    {
      name: dependabotDev ? 'Scope: Dependabot devDependency bump' : 'Scope: docs, demos and tests only',
      pass: blocked.length === 0,
      detail: blocked.join(', ')
    },
    {
      name: `Size: at most ${MAX_FILES} files and ${MAX_LINES} lines`,
      pass: paths.length <= MAX_FILES && lines <= MAX_LINES,
      detail: `${paths.length} files, ${lines} lines`
    },
    { name: `Label \`${LABELS.optIn}\``, pass: labels.includes(LABELS.optIn) },
    { name: `Label \`${LABELS.approved}\` (reviewer + QA passed)`, pass: labels.includes(LABELS.approved) }
  ];

  return { eligible: checks.every(c => c.pass), checks };
}

export function formatReport({ eligible, checks }) {
  const rows = checks.map(c => `| ${c.pass ? 'pass' : 'FAIL'} | ${c.name} | ${(c.detail || '').replaceAll('|', '\\|')} |`);
  return [
    '<!-- agent-merge-gate -->',
    `**Merge gate (dry run):** ${eligible ? 'would merge once required checks are green' : 'would not merge'}`,
    '',
    '| Result | Rule | Detail |',
    '| --- | --- | --- |',
    ...rows,
    '',
    '_Phase 1: the agent never merges. This report shows what Phase 2 would do._'
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  console.log(formatReport(evaluateGate(JSON.parse(input))));
}
