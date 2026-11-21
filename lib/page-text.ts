// The plain-text form of one page, as agents read it in /<page>.md and llms-full.txt.
// Relative links are made absolute, because the text is read outside the site's folder structure.
import { posix } from 'node:path';
import { site } from './shared';

interface TextPage {
  url: string;
  path: string;
  data: { title: string; description?: string; getText: (type: 'processed') => Promise<string> };
}

/** Maps a relative link in `page` to the absolute URL of the page it points at, or null. */
function resolveDocLink(href: string, page: TextPage, pages: TextPage[]): string | null {
  if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(href)) return null;
  const [file, hash = ''] = href.split(/(?=#)/);
  const target = posix.normalize(posix.join(posix.dirname(page.path), file));
  const hit = pages.find((p) => p.path === target);
  return hit ? `${site.url}${hit.url}.md${hash}` : null;
}

export async function renderPageText(page: TextPage, pages: TextPage[]): Promise<string> {
  const body = (await page.data.getText('processed')).replace(
    /(\]\()([^)\s]+)/g,
    (match, open: string, href: string) => {
      const abs = resolveDocLink(href, page, pages);
      return abs ? open + abs : match;
    },
  );
  const head = [`# ${page.data.title}`, ''];
  if (page.data.description) head.push(`> ${page.data.description}`, '');
  head.push(`Source: ${site.url}${page.url}`, '');
  return `${head.join('\n')}\n${body.trim()}\n`;
}
