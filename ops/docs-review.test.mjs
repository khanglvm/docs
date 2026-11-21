// Checks the gate that keeps the unattended docs review away from anything but docs.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { forbiddenPaths } from './docs-review.mjs';

test('the review may change docs pages, meta.json and README.md only', () => {
  assert.deepEqual(forbiddenPaths(['docs/cli.md', 'docs/guides/meta.json', 'README.md']), []);
  assert.deepEqual(
    forbiddenPaths(['package.json', '.github/workflows/docs.yml', 'src/cli.js', 'docs/../package.json', 'scripts/docs-readme.mjs', 'docs/README.md.sh']),
    ['package.json', '.github/workflows/docs.yml', 'src/cli.js', 'docs/../package.json', 'scripts/docs-readme.mjs', 'docs/README.md.sh'],
  );
});
