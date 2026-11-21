// Plain-text views of the docs for coding agents: the llms.txt index and one full file per library.
// Page order follows each library's meta.json, the same order as the sidebar.
import type { Node } from 'fumadocs-core/page-tree';
import { libraries, type Library } from './libraries';
import { renderPageText } from './page-text';
import { site } from './shared';
import { source } from './source';

type Page = NonNullable<ReturnType<typeof source.getPage>>;

/** The pages of one library in sidebar order. */
export function libraryPages(lib: Library): Page[] {
  const root = source.getPageTree().children.find(
    (node) => node.type === 'folder' && (node.index?.url === `/${lib.slug}` || node.$id?.endsWith(lib.slug)),
  );
  const urls: string[] = [];
  const visit = (node: Node) => {
    if (node.type === 'page') urls.push(node.url);
    if (node.type === 'folder') {
      if (node.index) urls.push(node.index.url);
      node.children.forEach(visit);
    }
  };
  if (root) visit(root);
  const byUrl = new Map(source.getPages().map((page) => [page.url, page]));
  return [...new Set(urls)].map((url) => byUrl.get(url)).filter((page): page is Page => Boolean(page));
}

const abs = (path: string) => `${site.url}${path}`;

export function renderIndex(): string {
  const lines = [
    `# ${site.title}`,
    '',
    `> ${site.description}`,
    '',
    'Every page below is plain Markdown. Each library also has all of its pages in one file (llms-full.txt), which is the quickest way to load one tool into context.',
  ];
  for (const lib of libraries) {
    const pages = libraryPages(lib);
    if (pages.length === 0) continue;
    const version = lib.sync?.version ? `npm ${lib.package}@${lib.sync.version}` : 'not on npm yet';
    lines.push('', `## ${lib.title}`, '', `${lib.blurb} Install: \`${lib.install}\` (${version}). Source: https://github.com/${lib.repo}`, '');
    lines.push(`- [All ${lib.title} docs in one file](${abs(`/${lib.slug}/llms-full.txt`)})`);
    for (const page of pages) {
      const desc = page.data.description ? `: ${page.data.description}` : '';
      lines.push(`- [${page.data.title}](${abs(`${page.url}.md`)})${desc}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

export async function renderLibraryFull(lib: Library): Promise<string> {
  const header = [
    `# ${lib.title}`,
    '',
    `> ${lib.blurb}`,
    '',
    `Install: \`${lib.install}\`. Source: https://github.com/${lib.repo}. Synced from ${lib.sync ? `${lib.sync.branch} @ ${lib.sync.sha.slice(0, 7)}` : 'a local preview'}.`,
  ].join('\n');
  const bodies = await Promise.all(
    libraryPages(lib).map((page) => renderPageText(page, source.getPages())),
  );
  return `${[header, ...bodies].join('\n\n---\n\n')}\n`;
}
