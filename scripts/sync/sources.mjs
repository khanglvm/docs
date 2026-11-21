// Network side of the sync: asks GitHub for a branch's latest commit, asks npm for the published
// version, and downloads a repo's docs/ folder at an exact commit.

import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';

const GITHUB_API = 'https://api.github.com';

function githubHeaders() {
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'oss-docs-sync' };
  // In GitHub Actions the workflow token lifts the 60 requests/hour anonymous limit.
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function getJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

/** Latest commit SHA of `branch` in `repo` ("owner/name"). */
export async function fetchHeadSha(repo, branch) {
  const data = await getJson(`${GITHUB_API}/repos/${repo}/commits/${encodeURIComponent(branch)}`, githubHeaders());
  return data.sha;
}

/** Version npm serves as `latest`, or null when the package is not published yet. */
export async function fetchNpmVersion(pkg) {
  if (!pkg) return null;
  const res = await fetch(`https://registry.npmjs.org/${pkg.replace('/', '%2F')}/latest`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`npm answered ${res.status} for ${pkg}`);
  return (await res.json()).version;
}

/**
 * Extracts `docs/` of `repo` at `sha` into `dest`, so files land at `dest/docs/...`.
 * Uses the system tar, which every macOS and Linux runner has, to avoid a dependency.
 */
export async function downloadDocs(repo, sha, dest) {
  const res = await fetch(`https://codeload.github.com/${repo}/tar.gz/${sha}`, { headers: githubHeaders() });
  if (!res.ok) throw new Error(`downloading ${repo}@${sha.slice(0, 7)} answered ${res.status}`);
  await mkdir(dest, { recursive: true });
  // The archive's top folder is "<name>-<sha>/"; strip it and keep only docs/.
  // GNU tar (Linux runners) needs --wildcards for the pattern; bsdtar (macOS) matches patterns by default.
  const wildcard = process.platform === 'darwin' ? [] : ['--wildcards'];
  const tar = spawn('tar', ['-xzf', '-', '-C', dest, '--strip-components=1', ...wildcard, '*/docs/*'], {
    stdio: ['pipe', 'ignore', 'pipe'],
  });
  let stderr = '';
  tar.stderr.on('data', (d) => (stderr += d));
  Readable.fromWeb(res.body).pipe(tar.stdin);
  const code = await new Promise((resolve) => tar.on('close', resolve));
  // tar exits non-zero when the pattern matched nothing, which means the repo has no docs/ folder.
  if (code !== 0) throw new Error(`${repo} has no docs/ folder at ${sha.slice(0, 7)} (${stderr.trim()})`);
}
