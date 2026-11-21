// Library metadata for the hub and page headers: libraries.json (what to publish) joined with
// content/sync-state.json (what the last sync pulled: commit, npm version, time).
import config from '@/libraries.json';
import syncState from '@/content/sync-state.json';

export interface SyncInfo {
  sha: string;
  version: string | null;
  branch: string;
  syncedAt: string;
}

export interface Library {
  slug: string;
  repo: string;
  branch: string;
  package: string | null;
  install: string;
  title: string;
  blurb: string;
  icon: string;
  sync: SyncInfo | null;
}

const state = syncState as Record<string, SyncInfo | undefined>;

export const libraries: Library[] = config.libraries.map((lib) => ({ ...lib, sync: state[lib.slug] ?? null }));

export function getLibrary(slug: string | undefined): Library | undefined {
  return libraries.find((lib) => lib.slug === slug);
}

/** GitHub URL of the file a site page was copied from (same path under the repo's docs/). */
export function sourceUrl(lib: Library, pathInLibrary: string): string {
  return `https://github.com/${lib.repo}/blob/${lib.branch}/docs/${pathInLibrary}`;
}
