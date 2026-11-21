// Decides which files of a repo's docs/ folder get published, from its meta.json files.
// Pure: works on a list of paths and a reader function, so it needs no real files to test.
//
// Only pages a meta.json lists are published. That keeps internal notes that live in docs/
// (design notes, development guides) off the site without asking repos to move them.

const SEPARATOR = /^---.*---$/;
const LINK = /^(external:)?\[.*\]\(.*\)$/;

export class ManifestError extends Error {}

/**
 * @param {string[]} files every file path under docs/, relative to docs/ (e.g. "guides/meta.json")
 * @param {(path: string) => string} read returns a file's text, given its path relative to docs/
 * @returns {{ pages: string[], metas: string[] }} paths relative to docs/, in sidebar order
 */
export function collectPublished(files, read) {
  const known = new Set(files);
  if (!known.has('meta.json')) throw new ManifestError('docs/meta.json is missing');
  const pages = [];
  const metas = [];
  walk('', known, read, pages, metas);
  if (pages.length === 0) throw new ManifestError('docs/meta.json lists no pages');
  return { pages, metas };
}

function walk(dir, known, read, pages, metas) {
  const metaPath = `${dir}meta.json`;
  metas.push(metaPath);
  let meta;
  try {
    meta = JSON.parse(read(metaPath));
  } catch (err) {
    throw new ManifestError(`docs/${metaPath} is not valid JSON: ${err.message}`);
  }
  if (!Array.isArray(meta.pages)) throw new ManifestError(`docs/${metaPath} needs a "pages" array`);
  for (const entry of meta.pages) {
    if (typeof entry !== 'string' || SEPARATOR.test(entry) || LINK.test(entry)) continue;
    // "..." and "z...a" mean "every other page"; the contract asks for explicit lists instead.
    if (/\.\.\./.test(entry)) throw new ManifestError(`docs/${metaPath}: list pages by name instead of "${entry}"`);
    const name = entry.replace(/^!/, '');
    const page = `${dir}${name}.md`;
    // MDX can run code during the site build, so the contract allows plain Markdown only.
    if (known.has(`${dir}${name}.mdx`)) throw new ManifestError(`docs/${dir}${name}.mdx: publish pages as plain .md, not .mdx`);
    if (known.has(page)) pages.push(page);
    else if (known.has(`${dir}${name}/meta.json`)) walk(`${dir}${name}/`, known, read, pages, metas);
    else throw new ManifestError(`docs/${metaPath} lists "${name}", but no ${dir}${name}.md or ${dir}${name}/meta.json exists`);
  }
}
