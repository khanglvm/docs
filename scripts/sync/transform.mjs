// Turns one Markdown page from a library repo into the form Fumadocs expects.
// Pure text in, text out: no file or network access, so every rule here is testable on strings.
//
// Repo pages are written to read well on GitHub: an H1 title, a first paragraph, relative links.
// The site needs frontmatter instead of the H1, and links that resolve outside the repo.

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;
const H1 = /^#\s+(.+?)\s*#*\s*$/m;

/** Reads `key: value` lines from a frontmatter block. Values may be quoted. */
export function parseFrontmatter(text) {
  const match = text.match(FRONTMATTER);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return { data, body: text.slice(match[0].length) };
}

// A line that is only a link ("[Back to the README](../README.md)") is navigation, not content.
const NAV_LINE = /^\[[^\]]+\]\([^)]+\)\.?$/;

/**
 * Finds the page summary: the first prose paragraph before any heading. Navigation lines in front
 * of it are dropped too, since the site has its own navigation.
 * @returns {{ summary: string, body: string }} body without the summary and the navigation lines
 */
export function takeSummary(body) {
  const blocks = body.split(/\n\s*\n/);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block || NAV_LINE.test(block)) continue;
    if (/^(#|```|~~~|[-*+]\s|\d+\.\s|>|!\[|<|\|)/.test(block)) break;
    // Descriptions are plain text on the site and in llms.txt, so Markdown links keep only their text.
    const summary = block
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\s+/g, ' ')
      .replace(/[*_`]/g, '');
    return { summary, body: blocks.slice(i + 1).join('\n\n') };
  }
  return { summary: '', body };
}

const quote = (value) => JSON.stringify(String(value));

/**
 * Rewrites a relative link target. Links to other published pages become site paths
 * (/<slug>/<page>), because the site serves pages without a trailing slash and a browser would
 * resolve "profiles.md" on /jira-cli to /profiles.md. Anything else in the repo (README, source,
 * examples) points at GitHub.
 * @param {string} target link target as written in the page
 * @param {{ pagePath: string, published: Set<string>, repoUrl: string, ref: string, slug: string }} ctx
 *   pagePath is the page's path inside docs/ (e.g. "guides/plugins.md").
 */
export function rewriteLink(target, ctx) {
  if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) return target;
  const [pathPart, hash = ''] = target.split(/(?=#)/);
  const fromDir = ctx.pagePath.split('/').slice(0, -1);
  const resolved = resolvePath([...fromDir], pathPart);
  if (resolved === null) return target;
  const inDocs = resolved.startsWith('docs/') ? resolved.slice(5) : null;
  // Published pages and docs/assets/ (copied by the sync) resolve on the site itself.
  if (inDocs !== null && ctx.published.has(inDocs)) return sitePath(ctx.slug, inDocs) + hash;
  // docs/assets/ is copied by the sync and stays relative to the page.
  if (inDocs !== null && inDocs.startsWith('assets/')) return target;
  const kind = pathPart.endsWith('/') ? 'tree' : 'blob';
  return `${ctx.repoUrl}/${kind}/${ctx.ref}/${resolved}${hash}`;
}

/** The site URL of a published page: "guides/index.md" in jira-cli is /jira-cli/guides. */
export function sitePath(slug, pageInDocs) {
  const route = pageInDocs.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
  return `/${slug}${route ? `/${route}` : ''}`;
}

// Resolves `rel` against a directory inside docs/, returning a repo-root path or null when it escapes.
function resolvePath(dirInDocs, rel) {
  const parts = ['docs', ...dirInDocs];
  for (const seg of rel.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (parts.length === 0) return null;
      parts.pop();
    } else parts.push(seg);
  }
  return parts.join('/');
}

// Applies rewriteLink to Markdown links and images outside fenced code blocks.
function rewriteLinks(body, ctx) {
  const pieces = body.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/);
  return pieces
    .map((piece, i) =>
      i % 2 === 1
        ? piece
        : piece.replace(/(!?\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g, (_, open, target, close) => {
            // Images stay relative only when the sync copies them (docs/assets/); see index.mjs.
            return open + rewriteLink(target, ctx) + close;
          }),
    )
    .join('');
}

// A "## Contents" heading followed only by a list of in-page anchors repeats the site's
// "On this page" panel, so it is dropped. Any other section named Contents is kept.
const CONTENTS_LIST = /^##\s+(Contents|Table of contents)\s*\n+((?:\s*(?:[-*+]|\d+\.)\s+\[[^\]]+\]\(#[^)]+\)\s*\n?)+)/im;

export function dropContentsList(body) {
  return body.replace(CONTENTS_LIST, '');
}

/**
 * Converts a repo page into a site page.
 * @param {string} text raw page text
 * @param {{ pagePath: string, published: Set<string>, repoUrl: string, ref: string }} ctx
 * @returns {{ text: string, title: string, description: string }}
 */
export function toSitePage(text, ctx) {
  const { data, body: rawBody } = parseFrontmatter(text.replace(/\r\n/g, '\n'));
  let body = rawBody;
  let title = data.title;
  const h1 = body.match(H1);
  // The H1 becomes the page title, so it is removed from the body to avoid showing it twice.
  if (h1 && body.slice(0, h1.index).trim() === '') {
    title ??= h1[1].replace(/[*_`]/g, '');
    body = body.slice(h1.index + h1[0].length);
  }
  title ??= ctx.pagePath.replace(/\.mdx?$/, '').split('/').pop();
  let description = data.description;
  // Without a frontmatter description, the first paragraph becomes the description and leaves the
  // body, because the site shows the description under the title.
  if (description === undefined) ({ summary: description, body } = takeSummary(body));
  body = dropContentsList(rewriteLinks(body, ctx)).replace(/^\s+/, '');
  const head = [`title: ${quote(title)}`];
  if (description) head.push(`description: ${quote(description)}`);
  return { text: `---\n${head.join('\n')}\n---\n\n${body}`, title, description };
}
