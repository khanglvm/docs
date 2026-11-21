import { Atom, BookOpen, Package, ScanSearch, Ticket, Webhook, type LucideIcon } from 'lucide-react';

// libraries.json names icons by their Lucide name; add a mapping here when a new library needs one.
const ICONS: Record<string, LucideIcon> = {
  atom: Atom,
  'book-open': BookOpen,
  'scan-search': ScanSearch,
  ticket: Ticket,
  webhook: Webhook,
};

export function LibraryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Package;
  return <Icon className={className} aria-hidden />;
}
