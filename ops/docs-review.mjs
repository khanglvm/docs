#!/usr/bin/env node
// Weekly docs review, run on the M6 by launchd (ops/install-review.sh sets it up).
//
// The per-repo contract makes agents update docs/ in the same commit as the code, and CI checks the
// README blocks. This job catches what those miss: for each library whose default branch moved since
// the last review, a headless Claude Code run (Khang's subscription, not the API) compares the code
// changes with docs/ and opens a pull request when a page no longer matches. It also re-enables the
// site's sync workflow, which GitHub pauses on repos without activity for 60 days.
//
// Usage: node ops/docs-review.mjs [--dry-run] [--only <slug>]

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const REPO_ROOT = new URL('../', import.meta.url).pathname;
const STATE_DIR = join(homedir(), '.local/share/oss-docs');
const STATE_FILE = join(STATE_DIR, 'review-state.json');
// Rebuildable clones live on the Bulk volume, per Khang's disk layout.
const WORK_DIR = '/Volumes/Bulk/cache/oss-docs-review';
const CLAUDE = join(homedir(), '.local/bin/claude');
// Changes only under these paths cannot make the docs wrong, so they skip the review.
const DOCS_ONLY = /^(docs\/|README\.md$|CHANGELOG\.md$|\.github\/|scripts\/docs-readme\.mjs$)/;

const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', ...opts }).trim();
const log = (msg) => console.log(`${new Date().toISOString()} ${msg}`);

function readState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function checkout(lib) {
  const dir = join(WORK_DIR, lib.slug);
  if (!existsSync(dir)) sh('git', ['clone', '--quiet', `https://github.com/${lib.repo}.git`, dir]);
  sh('git', ['-C', dir, 'fetch', '--quiet', 'origin']);
  sh('git', ['-C', dir, 'checkout', '--quiet', '--force', `origin/${lib.branch}`]);
  sh('git', ['-C', dir, 'clean', '-fdq']);
  return dir;
}

function prompt(lib, from, to) {
  return `You are reviewing whether the docs of ${lib.repo} still match its code. Work only in this checkout.

Read AGENTS.md (its "Docs" section is the contract) and docs/meta.json. Then read \`git diff ${from}..${to} -- . ':!docs' ':!README.md'\` and the commit messages in \`git log ${from}..${to}\`.

For every change to a command, flag, option, config key, output format, exported API, default or behaviour, check the published pages in docs/ (and docs/agents.md) describe the code at ${to.slice(0, 7)}. Read the source to confirm; never document something you have not seen in the code.

If every page already matches, change nothing and reply "docs up to date".

Otherwise:
1. git switch -c docs/review-${new Date().toISOString().slice(0, 10)}
2. Edit the docs pages (plain, friendly surface text; exact detail in agents and reference pages; H1 plus a one or two sentence summary on new pages; list new pages in docs/meta.json).
3. node scripts/docs-readme.mjs && node scripts/docs-readme.mjs --check
4. Commit with a message that names what changed, ending with: Co-Authored-By: Claude <noreply@anthropic.com>
5. git push -u origin HEAD, then gh pr create --fill --base ${lib.branch}
Reply with the PR URL. Do not touch package.json, workflows or source code, and do not merge.`;
}

function review(lib, dir, from, to, dryRun) {
  const changed = sh('git', ['-C', dir, 'diff', '--name-only', `${from}..${to}`]).split('\n').filter(Boolean);
  const codeChanges = changed.filter((file) => !DOCS_ONLY.test(file));
  if (codeChanges.length === 0) return log(`${lib.slug}: only docs changed since ${from.slice(0, 7)}, nothing to review`);
  log(`${lib.slug}: reviewing ${codeChanges.length} changed files ${from.slice(0, 7)}..${to.slice(0, 7)}`);
  if (dryRun) return;
  const run = spawnSync(
    CLAUDE,
    [
      '-p', prompt(lib, from, to),
      '--model', 'sonnet',
      '--permission-mode', 'acceptEdits',
      '--allowedTools', 'Read,Edit,Write,Glob,Grep,Bash(git:*),Bash(node scripts/docs-readme.mjs:*),Bash(node bin/*),Bash(gh pr create:*)',
    ],
    { cwd: dir, encoding: 'utf8', timeout: 30 * 60 * 1000 },
  );
  log(`${lib.slug}: ${(run.stdout || run.stderr || `exit ${run.status}`).trim().split('\n').slice(-3).join(' | ')}`);
  if (run.status !== 0) throw new Error(`claude exited ${run.status}`);
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  mkdirSync(STATE_DIR, { recursive: true });
  mkdirSync(WORK_DIR, { recursive: true });
  try {
    sh('gh', ['workflow', 'enable', 'sync', '-R', 'khanglvm/docs']);
  } catch (err) {
    log(`could not re-enable the sync workflow: ${err.message.split('\n')[0]}`);
  }
  const { libraries } = JSON.parse(readFileSync(join(REPO_ROOT, 'libraries.json'), 'utf8'));
  const state = readState();
  for (const lib of libraries.filter((l) => !only || l.slug === only)) {
    try {
      const dir = checkout(lib);
      const head = sh('git', ['-C', dir, 'rev-parse', 'HEAD']);
      const last = state[lib.slug];
      // The first run only records where reviews start, so old history is not reviewed at once.
      if (last && last !== head) review(lib, dir, last, head, dryRun);
      else log(`${lib.slug}: ${last ? 'no new commits' : 'first run, starting from'} ${head.slice(0, 7)}`);
      if (!dryRun) state[lib.slug] = head;
    } catch (err) {
      log(`${lib.slug}: review failed, will retry next week. ${err.message.split('\n')[0]}`);
    }
  }
  if (!dryRun) writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

main();
