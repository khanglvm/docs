// Pulls each library's docs/ folder into content/docs/<slug>/ when its repo or npm version changed.
//
// Usage: node scripts/sync/index.mjs [--force] [--only <slug>] [--local <slug>=<repo dir>]
//
// --local previews a library from a checkout on disk instead of GitHub, without touching the
// recorded sync state, so a repo's unpushed docs can be checked on the site.
//
// A library that fails to sync keeps its last good copy, so one broken repo never empties the site.
// Failures are listed in sync-errors.txt (for the workflow to report) and the exit code stays 0
// unless every library failed.

import { readFileSync as fsReadFileSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listFiles } from './files.mjs';
import { collectPublished } from './manifest.mjs';
import { downloadDocs, fetchHeadSha, fetchNpmVersion } from './sources.mjs';
import { toSitePage } from './transform.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const CONTENT = join(ROOT, 'content/docs');
const STATE_FILE = join(ROOT, 'content/sync-state.json');
const ERRORS_FILE = join(ROOT, 'sync-errors.txt');
// Copied as-is so pages can show images with relative links (docs/assets/diagram.png).
const ASSET_DIR = 'assets';

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

const exists = (path) => stat(path).then(() => true, () => false);

/** Builds content/docs/<slug>/ for one library in a staging folder, then swaps it in. */
async function syncLibrary(lib, sha, localDir) {
  const work = await mkdtemp(join(tmpdir(), `oss-docs-${lib.slug}-`));
  const stage = join(CONTENT, `.${lib.slug}.next`);
  try {
    if (localDir) await cp(join(localDir, 'docs'), join(work, 'docs'), { recursive: true });
    else await downloadDocs(lib.repo, sha, work);
    const docsDir = join(work, 'docs');
    const files = await listFiles(docsDir);
    const read = (p) => readFileSync(join(docsDir, p));
    const { pages, metas } = collectPublished(files, read);
    const published = new Set(pages);
    await rm(stage, { recursive: true, force: true });
    const ctx = { slug: lib.slug, published, repoUrl: `https://github.com/${lib.repo}`, ref: sha };
    for (const page of pages) {
      const { text } = toSitePage(read(page), { ...ctx, pagePath: page });
      await writeOut(join(stage, page), text);
    }
    for (const meta of metas) await writeOut(join(stage, meta), siteMeta(meta, read(meta), lib));
    if (await exists(join(docsDir, ASSET_DIR))) await cp(join(docsDir, ASSET_DIR), join(stage, ASSET_DIR), { recursive: true });
    await swapIn(stage, join(CONTENT, lib.slug));
    return pages.length;
  } finally {
    // A failed sync must not leave a half-built stage in content/, where the workflow would commit it.
    await rm(stage, { recursive: true, force: true });
    await rm(work, { recursive: true, force: true });
  }
}

// Replaces target with stage. The old copy moves aside first and comes back if the swap fails,
// so the last good pages are never lost.
async function swapIn(stage, target) {
  const old = `${target}.old`;
  await rm(old, { recursive: true, force: true });
  const hadOld = await exists(target);
  if (hadOld) await rename(target, old);
  try {
    await rename(stage, target);
  } catch (err) {
    if (hadOld) await rename(old, target);
    throw err;
  }
  await rm(old, { recursive: true, force: true });
}

// The library's top meta.json becomes a sidebar root, so the site shows one library at a time
// with a switcher. Nested meta.json files pass through unchanged.
function siteMeta(path, text, lib) {
  if (path !== 'meta.json') return text;
  const meta = JSON.parse(text);
  return `${JSON.stringify({ ...meta, title: lib.title, description: lib.blurb, root: true }, null, 2)}\n`;
}

async function writeOut(path, text) {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, text);
}

// collectPublished takes a synchronous reader; docs folders are small, so sync reads are fine here.
const readFileSync = (path) => fsReadFileSync(path, 'utf8');

function parseArgs(argv) {
  const only = argv.indexOf('--only');
  const local = argv.indexOf('--local');
  const [localSlug, localDir] = local >= 0 ? argv[local + 1].split('=') : [];
  return { force: argv.includes('--force'), only: only >= 0 ? argv[only + 1] : localSlug ?? null, localDir };
}

async function main() {
  const { libraries } = await readJson(join(ROOT, 'libraries.json'), { libraries: [] });
  const { force, only, localDir } = parseArgs(process.argv.slice(2));
  if (localDir) {
    const lib = libraries.find((l) => l.slug === only);
    if (!lib) throw new Error(`--local names an unknown library: ${only}`);
    console.log(`${lib.slug}: previewed ${await syncLibrary(lib, 'HEAD', localDir)} pages from ${localDir}`);
    return;
  }
  const state = await readJson(STATE_FILE, {});
  const errors = [];
  let changed = 0;
  for (const lib of libraries.filter((l) => !only || l.slug === only)) {
    try {
      const [sha, version] = await Promise.all([fetchHeadSha(lib.repo, lib.branch), fetchNpmVersion(lib.package)]);
      const prev = state[lib.slug];
      if (!force && prev?.sha === sha && prev?.version === version) {
        console.log(`${lib.slug}: unchanged (${sha.slice(0, 7)})`);
        continue;
      }
      const count = await syncLibrary(lib, sha);
      state[lib.slug] = { sha, version, branch: lib.branch, syncedAt: new Date().toISOString() };
      changed++;
      console.log(`${lib.slug}: synced ${count} pages from ${sha.slice(0, 7)}${version ? ` (npm ${version})` : ''}`);
    } catch (err) {
      errors.push(`${lib.slug} (${lib.repo}): ${err.message}`);
      console.error(`${lib.slug}: kept the last good copy. ${err.message}`);
    }
  }
  await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  if (errors.length) await writeFile(ERRORS_FILE, `${errors.join('\n')}\n`);
  else await rm(ERRORS_FILE, { force: true });
  console.log(`${changed} changed, ${errors.length} failed`);
  if (errors.length && changed === 0 && errors.length === libraries.length) process.exit(1);
}

await main();
