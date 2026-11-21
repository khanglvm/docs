// Runs after `next build`: moves the agent-facing files to the URLs the site promises.
//   out/llms.mdx/<page>.md        -> out/<page>.md          (plain Markdown next to each page)
//   out/llms-full/<slug>.txt      -> out/<slug>/llms-full.txt
// Next's static export cannot emit these paths directly, because they sit beside the docs routes.
import { cp, mkdir, readdir, rename, rm } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

const OUT = new URL('../out/', import.meta.url).pathname;

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)])));
  return nested.flat();
}

const mdDir = join(OUT, 'llms.mdx');
for (const file of await files(mdDir)) {
  const target = join(OUT, relative(mdDir, file));
  await mkdir(dirname(target), { recursive: true });
  await cp(file, target);
}
await rm(mdDir, { recursive: true });

const fullDir = join(OUT, 'llms-full');
for (const file of await files(fullDir)) {
  const slug = relative(fullDir, file).replace(/\.txt$/, '');
  await mkdir(join(OUT, slug), { recursive: true });
  await rename(file, join(OUT, slug, 'llms-full.txt'));
}
await rm(fullDir, { recursive: true });
console.log('agent files placed');
