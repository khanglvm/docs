import { RefreshCw } from 'lucide-react';
import type { SyncInfo } from '@/lib/libraries';

/** Shows which release and commit a page was copied from, linking to that commit. */
export function SyncBadge({ sync, repo }: { sync: SyncInfo; repo: string }) {
  const label = sync.version ? `v${sync.version}` : sync.sha.slice(0, 7);
  return (
    <a
      href={`https://github.com/${repo}/commit/${sync.sha}`}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      title={`Synced ${new Date(sync.syncedAt).toUTCString()} from ${sync.branch} @ ${sync.sha.slice(0, 7)}`}
    >
      <RefreshCw className="size-3.5" />
      Synced from {label}
    </a>
  );
}
