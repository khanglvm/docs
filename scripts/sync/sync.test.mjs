// Checks the pure parts of the sync: which pages publish, and how a repo page becomes a site page.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectPublished, ManifestError } from './manifest.mjs';
import { rewriteLink, toSitePage } from './transform.mjs';

const ctx = (pagePath, published = ['index.md', 'state.md', 'guides/a.md']) => ({
  pagePath,
  published: new Set(published),
  repoUrl: 'https://github.com/o/r',
  ref: 'abc123',
});

test('publishes only pages meta.json lists, following nested folders', () => {
  const files = { 'meta.json': '{"pages":["index","---Guides---","guides","[Site](https://x.dev)"]}', 'index.md': '', 'design.md': '', 'guides/meta.json': '{"pages":["a"]}', 'guides/a.md': '' };
  const { pages, metas } = collectPublished(Object.keys(files), (p) => files[p]);
  assert.deepEqual(pages, ['index.md', 'guides/a.md']);
  assert.deepEqual(metas, ['meta.json', 'guides/meta.json']);
});

test('a listed page that does not exist is an error, and so is a missing meta.json', () => {
  assert.throws(() => collectPublished(['meta.json'], () => '{"pages":["gone"]}'), ManifestError);
  assert.throws(() => collectPublished(['index.md'], () => ''), /meta.json is missing/);
});

test('links to published pages stay relative; other repo links point at GitHub', () => {
  assert.equal(rewriteLink('state.md#api', ctx('index.md')), 'state.md#api');
  assert.equal(rewriteLink('../README.md', ctx('index.md')), 'https://github.com/o/r/blob/abc123/README.md');
  assert.equal(rewriteLink('../examples/app/', ctx('index.md')), 'https://github.com/o/r/tree/abc123/examples/app');
  assert.equal(rewriteLink('../../a.md', ctx('guides/a.md')), 'https://github.com/o/r/blob/abc123/a.md');
  assert.equal(rewriteLink('https://x.dev', ctx('index.md')), 'https://x.dev');
  assert.equal(rewriteLink('#local', ctx('index.md')), '#local');
});

test('the H1 becomes the title and the first paragraph the description', () => {
  const page = '# State\n\n[Back to the README](../README.md)\n\nKeeps [shared](x.md) `state`.\n\n## Contents\n\n1. [Use](#use)\n\n## Use\n\nSee ../README.md.\n';
  const { text, title, description } = toSitePage(page, ctx('state.md'));
  assert.equal(title, 'State');
  assert.equal(description, 'Keeps shared state.');
  assert.ok(text.startsWith('---\ntitle: "State"\ndescription: "Keeps shared state."\n---\n\n## Use'));
});

test('frontmatter wins over the derived title and description, and code blocks are left alone', () => {
  const page = '---\ntitle: Custom\ndescription: "Short."\n---\n# Ignored\n\n```md\n[x](../README.md)\n```\n';
  const { text, title } = toSitePage(page, ctx('index.md'));
  assert.equal(title, 'Custom');
  assert.ok(text.includes('[x](../README.md)'));
});
