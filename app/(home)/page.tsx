import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { CopyCommand } from '@/components/copy-command';
import { LibraryIcon } from '@/components/library-icon';
import { libraries, type Library } from '@/lib/libraries';
import { source } from '@/lib/source';
import { site } from '@/lib/shared';

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="hub-wash">
        <div className="mx-auto max-w-[1160px] px-4 pb-12 pt-16 md:px-8 md:pb-14 md:pt-24">
          <h1 className="max-w-[720px] text-4xl font-semibold leading-[1.06] tracking-[-0.035em] md:text-[56px]">
            Small tools for working with coding agents
          </h1>
          <p className="mt-5 max-w-[600px] text-base text-fd-muted-foreground md:text-lg">{site.description}</p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a href="#tools" className="inline-flex h-10 items-center gap-2 rounded-full bg-fd-primary px-[18px] text-sm font-medium text-fd-primary-foreground">
              Browse tools <ArrowRight className="size-4" />
            </a>
            <a href="/llms.txt" className="inline-flex h-10 items-center gap-2 rounded-full border bg-fd-card px-[18px] text-sm font-medium">
              <FileText className="size-4" /> llms.txt for agents
            </a>
          </div>
        </div>
      </section>
      <section id="tools" className="mx-auto grid max-w-[1160px] gap-4 px-4 pb-24 pt-2 md:grid-cols-2 md:px-8 lg:grid-cols-3">
        {/* A library shows once its first sync has produced pages. */}
        {libraries.filter((lib) => source.getPage([lib.slug])).map((lib) => (
          <LibraryCard key={lib.slug} lib={lib} />
        ))}
      </section>
    </main>
  );
}

function LibraryCard({ lib }: { lib: Library }) {
  const version = lib.sync?.version;
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border bg-fd-card p-5 transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(20,20,30,0.18)]">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-[10px] bg-fd-muted">
          <LibraryIcon name={lib.icon} className="size-[18px]" />
        </span>
        <div>
          {/* The whole card is clickable through this link's overlay; the copy button sits above it. */}
          <Link href={`/${lib.slug}`} className="font-semibold tracking-tight after:absolute after:inset-0 after:rounded-2xl">
            {lib.title}
          </Link>
          <div className="font-mono text-xs text-fd-muted-foreground">{version ? `v${version}` : 'Not on npm yet'}</div>
        </div>
      </div>
      <p className="flex-1 text-sm text-fd-muted-foreground">{lib.blurb}</p>
      {lib.sync?.version || !lib.package ? <CopyCommand command={lib.install} /> : null}
    </div>
  );
}
