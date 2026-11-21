// Builds /llms-full/<slug>.txt; scripts/agent-files.mjs moves each file to /<slug>/llms-full.txt,
// because a [slug] route here would collide with the docs catch-all.
import { renderLibraryFull } from '@/lib/llms';
import { getLibrary, libraries } from '@/lib/libraries';
import { source } from '@/lib/source';

export const revalidate = false;
export const dynamicParams = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms-full/[file]'>) {
  const lib = getLibrary((await params).file.replace(/\.txt$/, ''));
  if (!lib) return new Response(null, { status: 404 });
  return new Response(await renderLibraryFull(lib), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

export function generateStaticParams() {
  return libraries.filter((lib) => source.getPage([lib.slug])).map((lib) => ({ file: `${lib.slug}.txt` }));
}
