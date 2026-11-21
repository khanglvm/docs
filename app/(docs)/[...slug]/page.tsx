import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getLibrary, sourceUrl } from '@/lib/libraries';
import { SyncBadge } from '@/components/sync-badge';

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  // The first path segment is the library; the rest matches the file's path in that repo's docs/.
  const [slug, ...rest] = page.path.split('/');
  const lib = getLibrary(slug);
  // Agents fetch this plain-text copy; scripts/agent-files.mjs also places it at <page url>.md.
  const markdownUrl = `${page.url}.md`;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row flex-wrap items-center gap-2 border-b pb-6">
        {lib?.sync && <SyncBadge sync={lib.sync} repo={lib.repo} />}
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={lib ? sourceUrl(lib, rest.join('/')) : undefined} />
      </div>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams().filter((p) => p.slug.length > 0);
}

export async function generateMetadata(props: PageProps<'/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  const lib = getLibrary(page.path.split('/')[0]);
  return {
    title: lib && lib.title !== page.data.title ? `${page.data.title} · ${lib.title}` : page.data.title,
    description: page.data.description,
  };
}
